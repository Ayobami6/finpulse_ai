import os
import sys
from dotenv import load_dotenv


def verify():
    print("Checking for .env loading...")

    # Load .env
    load_dotenv()

    # Check for a specific variable
    # I'll check the output of the view_file call first
    test_var = "GOOGLE_GEMINI_API_KEY"
    value = os.getenv(test_var)

    if value:
        print(f"SUCCESS: {test_var} is loaded.")
        # print(f"Value starts with: {value[:5]}...") # Security: don't print keys
    else:
        print(f"FAILURE: {test_var} is NOT loaded.")


if __name__ == "__main__":
    verify()
