import pymongo
import bcrypt
import getpass
from datetime import datetime

# --- CONFIGURATION ---
MONGO_URI = "mongodb+srv://gayushman4004an_db_user:r4tHt4@aarohan.nz64ssr.mongodb.net/aarohan?retryWrites=true&w=majority"
DB_NAME = "aarohan"

def add_counselor():
    try:
        # 1. Connect to MongoDB
        client = pymongo.MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db["counselors"]

        print("\n" + "="*50)
        print("               COUNSELOR ACCOUNT SETUP")
        print("="*50 + "\n")
        
        # 2. Get Input
        phone = input("📱 Phone Number (10 digits): ").strip()
        if not phone or len(phone) != 10:
            print("❌ Error: Valid 10-digit phone number required.")
            return

        # Check if counselor already exists
        existing = collection.find_one({"phone": phone})
        if existing:
            print(f"\n⚠️  Counselor with phone {phone} already exists!")
            update = input("Do you want to update this counselor? (y/n): ").strip().lower()
            if update != 'y':
                return
            is_update = True
        else:
            is_update = False

        name = input("👤 Full Name: ").strip()
        email = input("📧 Email (optional, press Enter to skip): ").strip()
        
        # Password setup
        print("\n🔐 Password Setup:")
        password = getpass.getpass("   Enter Password: ")
        if not password:
            print("❌ Error: Password cannot be empty.")
            return
        confirm_password = getpass.getpass("   Confirm Password: ")
        if password != confirm_password:
            print("❌ Error: Passwords do not match.")
            return

        # Admin access
        admin_input = input("\n🔑 Grant Admin Access? (y/n): ").strip().lower()
        has_admin_access = admin_input == 'y'

        # Profile completion status
        profile_input = input("✅ Mark profile as completed? (y/n): ").strip().lower()
        profile_completed = profile_input == 'y'

        # 3. Hash Password using bcrypt
        salt = bcrypt.gensalt(rounds=10)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        # 4. Build document
        counselor_doc = {
            "phone": phone,
            "password": hashed_password.decode('utf-8'),
            "name": name if name else None,
            "email": email if email else None,
            "hasAdminAccess": has_admin_access,
            "profileCompleted": profile_completed,
            "verificationStatus": "approved",
            "sessionsCompleted": 0,
            "assignedStudents": 0,
            "languages": [],
            "specializations": [],
            "availableSlots": [],
            "createdAt": datetime.utcnow(),
            "lastLogin": datetime.utcnow(),
            "__v": 0
        }

        # 5. Insert or Update
        if is_update:
            # Update existing counselor
            update_fields = {
                "password": hashed_password.decode('utf-8'),
                "hasAdminAccess": has_admin_access,
                "profileCompleted": profile_completed,
                "lastLogin": datetime.utcnow()
            }
            if name:
                update_fields["name"] = name
            if email:
                update_fields["email"] = email
                
            collection.update_one({"phone": phone}, {"$set": update_fields})
            print(f"\n✅ Counselor updated successfully!")
        else:
            result = collection.insert_one(counselor_doc)
            print(f"\n✅ Counselor created with ID: {result.inserted_id}")

        # Summary
        print("\n" + "-"*50)
        print("ACCOUNT SUMMARY:")
        print(f"  Phone: {phone}")
        print(f"  Name: {name or 'Not set'}")
        print(f"  Admin Access: {'Yes ✓' if has_admin_access else 'No'}")
        print(f"  Profile Complete: {'Yes ✓' if profile_completed else 'No'}")
        print("-"*50 + "\n")

    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()

def list_counselors():
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db["counselors"]
        
        counselors = list(collection.find({}, {"phone": 1, "name": 1, "hasAdminAccess": 1, "profileCompleted": 1}))
        
        print("\n" + "="*60)
        print("       ALL COUNSELORS")
        print("="*60)
        
        if not counselors:
            print("No counselors found.")
        else:
            for c in counselors:
                admin_badge = "🔑 ADMIN" if c.get("hasAdminAccess") else ""
                profile_badge = "✅" if c.get("profileCompleted") else "⏳"
                print(f"  {profile_badge} {c.get('phone', 'N/A')} - {c.get('name', 'No name')} {admin_badge}")
        
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()

def toggle_admin_access():
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db["counselors"]
        
        phone = input("📱 Enter counselor phone number: ").strip()
        counselor = collection.find_one({"phone": phone})
        
        if not counselor:
            print(f"❌ Counselor with phone {phone} not found.")
            return
            
        current_status = counselor.get("hasAdminAccess", False)
        new_status = not current_status
        
        collection.update_one({"phone": phone}, {"$set": {"hasAdminAccess": new_status}})
        
        status_text = "GRANTED ✅" if new_status else "REVOKED ❌"
        print(f"\n🔑 Admin access {status_text} for {counselor.get('name', phone)}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()

def main():
    while True:
        print("\n" + "="*50)
        print("       COUNSELOR MANAGEMENT")
        print("="*50)
        print("  1. Add/Update Counselor")
        print("  2. List All Counselors")
        print("  3. Toggle Admin Access")
        print("  4. Exit")
        print("="*50)
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            add_counselor()
        elif choice == "2":
            list_counselors()
        elif choice == "3":
            toggle_admin_access()
        elif choice == "4":
            print("\n👋 Goodbye!\n")
            break
        else:
            print("❌ Invalid option. Please try again.")

if __name__ == "__main__":
    main()
