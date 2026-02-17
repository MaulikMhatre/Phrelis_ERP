import sys
import os
sys.path.append(os.path.abspath("backend"))
from sqlalchemy.orm import Session
import database
from database import SessionLocal, engine
import models
from billing_service import BillingService
from datetime import datetime

def reproduce_get_bill(admission_uid: str):
    db = SessionLocal()
    try:
        print(f"Checking {admission_uid}...")
        adm = db.query(models.Admission).filter(models.Admission.admission_uid == admission_uid).first()
        if not adm:
            print("Admission not found")
            return

        print(f"Admission found: {adm.patient_name}, bed_id: {adm.bed_id}, status: {adm.status}")
        
        # Bed Days
        try:
            days = BillingService.calculate_bed_days(adm.admission_time, datetime.utcnow())
            print(f"Bed days: {days}")
        except Exception as e:
            print(f"ERROR in calculate_bed_days: {e}")
            raise

        # Bed Charge
        bed = db.query(models.BedModel).filter(models.BedModel.id == adm.bed_id).first()
        if bed:
            print(f"Bed found: {bed.id}, category: {bed.billing_category}")
            bed_cat = bed.billing_category or "Ward"
        else:
            print("Bed not found, using 'Ward'")
            bed_cat = "Ward"
            
        bed_price_item = db.query(models.PriceMaster).filter_by(name=bed_cat).first()
        if bed_price_item:
            print(f"Price item found: {bed_price_item.name}, price: {bed_price_item.price}")
            bed_price = bed_price_item.price if bed_price_item.price is not None else 3000.0
        else:
            print(f"Price item for {bed_cat} not found, using 3000.0")
            bed_price = 3000.0
            
        bed_total = days * bed_price
        print(f"Bed total: {bed_total}")
        
        # Surgeries
        surgeries = db.query(models.SurgeryLog).filter_by(admission_uid=admission_uid).all()
        print(f"Found {len(surgeries)} surgeries")
        for s in surgeries:
            print(f"  Surgery: {s.surgery_name}, price: {s.price_at_time}")
        
        try:
            surg_total = sum(s.price_at_time for s in surgeries)
            print(f"Surgery total: {surg_total}")
        except TypeError as e:
            print(f"TypeError in surgery sum: {e}")
            raise

        # Consumables
        consumables = db.query(models.InventoryLog).filter_by(admission_uid=admission_uid).all()
        print(f"Found {len(consumables)} consumables")
        cons_total = 0.0
        cons_tax = 0.0
        for log in consumables:
            inv_item_query = db.query(models.InventoryItem).filter(models.InventoryItem.id == log.item_id).first()
            if not inv_item_query:
                print(f"  Log item {log.item_id} not found in InventoryItem")
                continue
                
            item_master = db.query(models.PriceMaster).filter(
                models.PriceMaster.category == "CONSUMABLE",
                models.PriceMaster.name == inv_item_query.name
            ).first()
            
            if item_master:
                price = item_master.price or 0.0
                tax_rate = item_master.gst_percent or 0.0
                qty = log.quantity_used or 0
                
                line_total = price * qty
                line_tax = line_total * (tax_rate / 100)
                
                cons_total += line_total
                cons_tax += line_tax
            else:
                print(f"  Price item for consumable {inv_item_query.name} not found")
        
        print(f"Consumable total: {cons_total}, tax: {cons_tax}")
        grand_total = bed_total + surg_total + cons_total + cons_tax
        print(f"Grand total: {grand_total}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    uid = sys.argv[1] if len(sys.argv) > 1 else "ADM-20260215-1750"
    reproduce_get_bill(uid)
