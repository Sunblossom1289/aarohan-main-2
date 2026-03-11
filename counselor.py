import pymongo
import bcrypt
import csv
import os
from datetime import datetime

# --- CONFIGURATION ---
MONGO_URI = "mongodb+srv://gayushman4004an_db_user:r4tHt4@aarohan.nz64ssr.mongodb.net/aarohan?retryWrites=true&w=majority"
DB_NAME = "aarohan"
CSV_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Counsellor Tracker.xlsx.csv")
DEFAULT_PASSWORD = "myaarohan2244"

def bulk_create_from_csv():
    """Read the CSV file and create/update counselor profiles for everyone."""
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db["counselors"]

        # Hash the default password once (same for everyone)
        salt = bcrypt.gensalt(rounds=10)
        hashed_password = bcrypt.hashpw(DEFAULT_PASSWORD.encode('utf-8'), salt).decode('utf-8')

        # Read CSV
        with open(CSV_FILE, newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)  # skip header row

            created = 0
            updated = 0
            skipped = 0

            print("\n" + "=" * 60)
            print("       BULK COUNSELOR IMPORT FROM CSV")
            print("=" * 60 + "\n")

            for row in reader:
                # CSV columns: s.no, Name, (empty), Phone, (empty), email, ...
                if len(row) < 4 or not row[3].strip():
                    continue  # skip empty rows

                name = row[1].strip() if len(row) > 1 else ""
                phone = row[3].strip() if len(row) > 3 else ""
                email = row[5].strip() if len(row) > 5 else ""

                if not phone:
                    print(f"  ⏭️  Skipping row (no phone): {name}")
                    skipped += 1
                    continue

                existing = collection.find_one({"phone": phone})
                if existing:
                    # Update existing counselor
                    update_fields = {
                        "password": hashed_password,
                        "lastLogin": datetime.utcnow(),
                    }
                    if name:
                        update_fields["name"] = name
                    if email:
                        update_fields["email"] = email

                    collection.update_one({"phone": phone}, {"$set": update_fields})
                    print(f"  🔄 Updated: {name or phone} ({phone})")
                    updated += 1
                else:
                    # Create new counselor
                    counselor_doc = {
                        "phone": phone,
                        "password": hashed_password,
                        "name": name if name else None,
                        "email": email if email else None,
                        "hasAdminAccess": False,
                        "profileCompleted": False,
                        "verificationStatus": "approved",
                        "sessionsCompleted": 0,
                        "assignedStudents": 0,
                        "languages": [],
                        "specializations": [],
                        "availableSlots": [],
                        "createdAt": datetime.utcnow(),
                        "lastLogin": datetime.utcnow(),
                        "__v": 0,
                    }
                    result = collection.insert_one(counselor_doc)
                    print(f"  ✅ Created: {name or phone} ({phone}) -> ID: {result.inserted_id}")
                    created += 1

            print("\n" + "-" * 60)
            print("  IMPORT SUMMARY:")
            print(f"    Created : {created}")
            print(f"    Updated : {updated}")
            print(f"    Skipped : {skipped}")
            print(f"    Password: {DEFAULT_PASSWORD} (same for all)")
            print("-" * 60 + "\n")

    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()

def list_counselors():
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db["counselors"]

        counselors = list(collection.find({}, {"phone": 1, "name": 1, "email": 1, "hasAdminAccess": 1, "profileCompleted": 1}))

        print("\n" + "=" * 60)
        print("       ALL COUNSELORS")
        print("=" * 60)

        if not counselors:
            print("  No counselors found.")
        else:
            for i, c in enumerate(counselors, 1):
                admin_badge = "🔑 ADMIN" if c.get("hasAdminAccess") else ""
                profile_badge = "✅" if c.get("profileCompleted") else "⏳"
                email_str = f" | {c.get('email')}" if c.get("email") else ""
                print(f"  {i}. {profile_badge} {c.get('phone', 'N/A')} - {c.get('name', 'No name')}{email_str} {admin_badge}")

        print("=" * 60 + "\n")

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
        print("\n" + "=" * 50)
        print("       COUNSELOR MANAGEMENT")
        print("=" * 50)
        print("  1. Bulk Import from CSV")
        print("  2. List All Counselors")
        print("  3. Toggle Admin Access")
        print("  4. Exit")
        print("=" * 50)

        choice = input("\nSelect option (1-4): ").strip()

        if choice == "1":
            bulk_create_from_csv()
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
