
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from blood_service import BloodService

def test_b_plus():
    print("Testing B+ Compatibility...")
    
    # 1. Check if B+ can give to B+
    res = BloodService.check_compatibility("B+", "B+")
    print(f"B+ Donor to B+ Patient: {res}")
    
    # 2. Check if O+ can give to B+
    res = BloodService.check_compatibility("O+", "B+")
    print(f"O+ Donor to B+ Patient: {res}")
    
    # 3. Check compatible donor groups for B+ patient
    donors = BloodService.get_compatible_donor_groups("B+")
    print(f"Compatible donors for B+ patient: {donors}")
    
    # 4. Check if AB+ can give to B+
    res = BloodService.check_compatibility("AB+", "B+")
    print(f"AB+ Donor to B+ Patient: {res}")

if __name__ == "__main__":
    test_b_plus()
