from collections import defaultdict
import re
from datetime import datetime

def parse_log_file(content):
    """
    Parse log file content and detect security threats.

    Returns a structured dict with:
    - total_events: int
    - threats: int
    - warnings: int
    - clean_events: int
    - events: list of event dicts
    """
    lines = content.strip().split('\n')
    events = []
    ip_counter = defaultdict(int)

    threat_patterns = {
        'Failed Login': ['failed', 'invalid', 'authentication failure', 'login failed'],
        'Port Scan': ['port scan', 'nmap', 'syn flood', 'port probe'],
        'SQL Injection': ['select', 'union', 'drop table', 'or 1=1', 'or 1 = 1', "' or '"],
        'Brute Force': ['multiple failed', 'too many attempts', 'brute force', 'rate limit exceeded']
    }

    for line_num, line in enumerate(lines, 1):
        if not line.strip():
            continue

        # Extract IP address if present
        ip_match = re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', line)
        ip_address = ip_match.group(0) if ip_match else 'Unknown'

        if ip_address != 'Unknown':
            ip_counter[ip_address] += 1

        # Check for threat patterns
        line_lower = line.lower()
        detected_threat = None
        severity = 'info'

        for threat_type, keywords in threat_patterns.items():
            if any(keyword in line_lower for keyword in keywords):
                detected_threat = threat_type
                severity = 'critical' if threat_type in ['SQL Injection', 'Brute Force'] else 'high'
                break

        # Check for suspicious IP (more than 5 events)
        if ip_address != 'Unknown' and ip_counter[ip_address] > 5 and not detected_threat:
            detected_threat = 'Suspicious IP Activity'
            severity = 'warning'

        # If no threat detected but contains warning keywords
        if not detected_threat:
            warning_keywords = ['error', 'warning', 'suspicious', 'unusual', 'denied']
            if any(keyword in line_lower for keyword in warning_keywords):
                severity = 'warning'

        event = {
            'id': line_num,
            'timestamp': extract_timestamp(line),
            'message': line.strip(),
            'ip_address': ip_address,
            'threat_type': detected_threat,
            'severity': severity
        }
        events.append(event)

    # Calculate statistics
    total_events = len(events)
    threats = sum(1 for e in events if e['severity'] in ['critical', 'high'])
    warnings = sum(1 for e in events if e['severity'] == 'warning')
    clean_events = sum(1 for e in events if e['severity'] == 'info' and not e['threat_type'])

    return {
        'total_events': total_events,
        'threats': threats,
        'warnings': warnings,
        'clean_events': clean_events,
        'events': events
    }

def extract_timestamp(line):
    """Extract timestamp from log line if present."""
    # Common log timestamp patterns
    patterns = [
        r'\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}',  # 2024-01-15 10:30:45
        r'\d{2}/\w{3}/\d{4}:\d{2}:\d{2}:\d{2}',     # 15/Jan/2024:10:30:45
        r'\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}',     # Jan 15 10:30:45
    ]

    for pattern in patterns:
        match = re.search(pattern, line)
        if match:
            return match.group(0)

    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
