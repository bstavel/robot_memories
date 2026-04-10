"""
Convert robot_memories jsPsych JSON output to CSV.

Handles the browser console format where the JSON string is wrapped in single
quotes and backslashes are double-escaped (e.g. \\" instead of \").

Usage:
    python json_to_csv.py task_0408.json
    python json_to_csv.py task_0408.json --all   # include practice + instruction rows
"""

import json
import csv
import sys
import os

# Columns to include in the CSV (in order)
PIT_COLUMNS = [
    'block',
    'trial',
    'stimulus',
    'robot',
    'robot_type',
    'valence',
    'action',
    'video_category',
    'video_file',
    'rune',
    'rune_set',
    'correct',
    'choice',
    'rt',
    'accuracy',
    'sham',
    'trial_index',
    'time_elapsed',
    'task_version',
]


def load_json(path):
    with open(path, 'rb') as f:
        raw = f.read()
    content = raw.decode('utf-8').strip()
    # Strip surrounding single quotes added by browser console
    if content.startswith("'") and content.endswith("'"):
        content = content[1:-1]
        # Undo the double-escaped backslashes the console introduces
        content = content.replace('\\\\"', '\\"')
    return json.loads(content)


def convert(json_path, include_all=False):
    data = load_json(json_path)

    if include_all:
        rows = data
        columns = sorted(set(k for row in rows for k in row.keys()))
    else:
        # Keep only real task trials (block >= 1), excluding practice (block=0)
        rows = [
            d for d in data
            if d.get('trial_type') == 'pit-trial-memory' and d.get('block', 0) >= 1
        ]
        columns = PIT_COLUMNS

    out_path = os.path.splitext(json_path)[0] + '.csv'
    with open(out_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python json_to_csv.py <file.json> [--all]")
        sys.exit(1)
    json_path = sys.argv[1]
    include_all = '--all' in sys.argv
    convert(json_path, include_all=include_all)
