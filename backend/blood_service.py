from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models
import random

class BloodService:
    @staticmethod
    def generate_isbt_id():
        """Generates a pseudo ISBT-128 ID: [Facility-Code][Year][Sequential]"""
        # For Phrelis, Facility Code might be 'P1'
        year = datetime.utcnow().year % 100
        seq = random.randint(100000, 999999)
        return f"P1{year}{seq}"

    @staticmethod
    def split_bag(db: Session, parent_bag_id: str):
        """
        Splits a 'Whole Blood' bag into RBC, Plasma, and Platelets.
        Parent becomes PROCESSED.
        """
        parent = db.query(models.BloodInventory).filter(models.BloodInventory.bag_id == parent_bag_id).first()
        if not parent or parent.component_type != "Whole Blood":
            return None
        
        parent.status = "Processed"
        
        # Children definitions: (Name, ExpiryDays)
        components = [
            ("RBC", 35),
            ("Plasma", 365),
            ("Platelets", 5)
        ]
        
        children = []
        for name, days in components:
            child = models.BloodInventory(
                bag_id=BloodService.generate_isbt_id(),
                donor_id=parent.donor_id,
                blood_group=parent.blood_group,
                component_type=name,
                expiry_date=datetime.utcnow() + timedelta(days=days),
                status="Quarantine", # Always starts in Quarantine until tests cleared
                parent_bag_id=parent_bag_id,
                is_tested=parent.is_tested,
                test_results=parent.test_results
            )
            db.add(child)
            children.append(child)
        
        db.commit()
        return children

    @staticmethod
    def check_compatibility(donor_group: str, patient_group: str) -> bool:
        """
        Phrelis Safety Engine: Cross-match Guard
        Returns True if donor group can be given to patient group.
        """
        if not donor_group or not patient_group:
            return False

        # Normalize strings to prevent spacing/casing issues
        dg = donor_group.strip().upper()
        pg = patient_group.strip().upper()
        
        # Universal Donor: O-
        # Universal Recipient: AB+
        matrix = {
            "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
            "O+": ["O+", "A+", "B+", "AB+"],
            "A-": ["A-", "A+", "AB-", "AB+"],
            "A+": ["A+", "AB+"],
            "B-": ["B-", "B+", "AB-", "AB+"],
            "B+": ["B+", "AB+"],
            "AB-": ["AB-", "AB+"],
            "AB+": ["AB+"]
        }
        return pg in matrix.get(dg, [])

    @staticmethod
    def generate_donor_certificate(donor: models.Donor):
        """Generates digital certificate metadata."""
        return {
            "title": "Certificate of Honor",
            "cert_no": f"BN-{donor.id}-{datetime.utcnow().strftime('%Y%m%d')}",
            "donor_name": donor.name,
            "blood_group": donor.blood_group,
            "ngo_affiliation": donor.associated_ngo_id or "Independent",
            "date": datetime.utcnow().isoformat(),
            "impact": f"This donation has the potential to save up to 3 lives.",
            "verified_by": "Phrelis Blood-Nexus System"
        }

    @staticmethod
    def process_expiry(db: Session):
        """Background worker logic for marking expired bags."""
        now = datetime.utcnow()
        expired_bags = db.query(models.BloodInventory).filter(
            models.BloodInventory.expiry_date <= now,
            models.BloodInventory.status.notin_(["Wasted", "Transfused", "Processed"])
        ).all()
        
        count = 0
        for bag in expired_bags:
            bag.status = "Wasted"
            count += 1
        
        if count > 0:
            db.commit()
        return count

    @staticmethod
    def get_compatible_donor_groups(patient_group: str) -> list:
        """
        Returns all donor blood groups that are safe to transfuse into the given patient.
        This is the INVERSE of the donor-to-recipient matrix.
        e.g. An O- patient can only receive from O-.
             An AB+ patient can receive from all groups.
        """
        # Full donor -> [compatible recipient] matrix
        donor_matrix = {
            "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
            "O+":  ["O+", "A+", "B+", "AB+"],
            "A-":  ["A-", "A+", "AB-", "AB+"],
            "A+":  ["A+", "AB+"],
            "B-":  ["B-", "B+", "AB-", "AB+"],
            "B+":  ["B+", "AB+"],
            "AB-": ["AB-", "AB+"],
            "AB+": ["AB+"]
        }
        # Invert: find all donor groups whose recipient list includes patient_group
        return [donor for donor, recipients in donor_matrix.items() if patient_group in recipients]

    @staticmethod
    def find_fefo_unit(db: Session, blood_group: str, component_type: str):
        """
        Phrelis FEFO Engine (First Expire, First Out) — Exact Group Match.
        Used internally. Prefer find_compatible_fefo_unit for clinical decisions.
        """
        return db.query(models.BloodInventory).filter(
            models.BloodInventory.blood_group == blood_group,
            models.BloodInventory.component_type == component_type,
            models.BloodInventory.status == "Available"
        ).order_by(models.BloodInventory.expiry_date.asc()).first()

    @staticmethod
    def find_compatible_fefo_unit(db: Session, patient_group: str, component_type: str):
        """
        Phrelis Safety-Aware FEFO Engine.
        Finds the best available unit whose blood group is compatible with the patient,
        prioritising units expiring soonest (FEFO). This prevents the suggest endpoint
        from ever recommending an incompatible bag that would be blocked at reservation.
        """
        compatible_donors = BloodService.get_compatible_donor_groups(patient_group)
        return db.query(models.BloodInventory).filter(
            models.BloodInventory.blood_group.in_(compatible_donors),
            models.BloodInventory.component_type == component_type,
            models.BloodInventory.status == "Available"
        ).order_by(models.BloodInventory.expiry_date.asc()).first()
