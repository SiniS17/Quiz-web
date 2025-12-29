"""
sync_config.py - Utility to keep Python and JavaScript configs in sync

Run this script whenever you change config.py to automatically update config.js
Usage: python sync_config.py
"""

import re
from pathlib import Path
from config import (
    QUIZ_DIRECTORY_NAME,
    QUIZ_DIRECTORY_IN_ROOT,
    MAX_CONSECUTIVE_LINES,
    MIN_CONSECUTIVE_LINES,
    DEFAULT_PORT,
)


def sync_configs():
    """
    Read Python config and update JavaScript config file
    """
    js_config_path = Path('public/js/config.js')

    if not js_config_path.exists():
        print(f"❌ Error: {js_config_path} not found")
        return False

    # Read the JS config file
    with open(js_config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update the values using regex
    replacements = {
        r"QUIZ_DIRECTORY_NAME:\s*'[^']*'": f"QUIZ_DIRECTORY_NAME: '{QUIZ_DIRECTORY_NAME}'",
        r"QUIZ_DIRECTORY_IN_ROOT:\s*(true|false)": f"QUIZ_DIRECTORY_IN_ROOT: {'true' if QUIZ_DIRECTORY_IN_ROOT else 'false'}",
        r"MAX_CONSECUTIVE_LINES:\s*\d+": f"MAX_CONSECUTIVE_LINES: {MAX_CONSECUTIVE_LINES}",
        r"MIN_CONSECUTIVE_LINES:\s*\d+": f"MIN_CONSECUTIVE_LINES: {MIN_CONSECUTIVE_LINES}",
    }

    original_content = content
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)

    # Only write if changes were made
    if content != original_content:
        with open(js_config_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print("✅ Configuration synced successfully!")
        print(f"   QUIZ_DIRECTORY_NAME: '{QUIZ_DIRECTORY_NAME}'")
        print(f"   QUIZ_DIRECTORY_IN_ROOT: {QUIZ_DIRECTORY_IN_ROOT}")
        print(f"   MAX_CONSECUTIVE_LINES: {MAX_CONSECUTIVE_LINES}")
        print(f"   MIN_CONSECUTIVE_LINES: {MIN_CONSECUTIVE_LINES}")
        return True
    else:
        print("ℹ️  Configs already in sync, no changes needed")
        return True


def verify_sync():
    """
    Verify that Python and JavaScript configs match
    """
    js_config_path = Path('public/js/config.js')

    if not js_config_path.exists():
        print(f"❌ Error: {js_config_path} not found")
        return False

    with open(js_config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check each config value
    checks = [
        (f"QUIZ_DIRECTORY_NAME: '{QUIZ_DIRECTORY_NAME}'", "QUIZ_DIRECTORY_NAME"),
        (f"QUIZ_DIRECTORY_IN_ROOT: {'true' if QUIZ_DIRECTORY_IN_ROOT else 'false'}", "QUIZ_DIRECTORY_IN_ROOT"),
        (f"MAX_CONSECUTIVE_LINES: {MAX_CONSECUTIVE_LINES}", "MAX_CONSECUTIVE_LINES"),
        (f"MIN_CONSECUTIVE_LINES: {MIN_CONSECUTIVE_LINES}", "MIN_CONSECUTIVE_LINES"),
    ]

    all_match = True
    for expected, name in checks:
        if expected in content:
            print(f"✅ {name} matches")
        else:
            print(f"❌ {name} does NOT match")
            all_match = False

    return all_match


if __name__ == "__main__":
    print("🔄 Syncing configuration files...\n")

    if sync_configs():
        print("\n🔍 Verifying sync...\n")
        if verify_sync():
            print("\n✅ All configs are in sync!")
        else:
            print("\n⚠️  Some configs may not match. Please check manually.")
    else:
        print("\n❌ Sync failed. Please check the error messages above.")