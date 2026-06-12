import re
from datetime import datetime
from typing import Dict, List, Any
from collections import defaultdict


def parse_log_file(content: str) -> Dict[str, Any]:
    """
    Parse security log file content and detect threats.

    Args:
        content: Raw log file content as string

    Returns:
        Dictionary containing analysis results with threats, warnings, and events
    """
    lines = content.strip().split('\n')
    events = []
    ip_event_count = defaultdict(int)

    for line in lines:
        if not line.strip():
            continue

        event = parse_log_line(line)
        if event:
            events.append(event)
            ip_event_count[event['source_ip']] += 1

    # Detect suspicious IPs (more than 5 events)
    suspicious_ips = {ip for ip, count in ip_event_count.items() if count > 5}

    # Update events with suspicious IP warnings
    for event in events:
        if event['source_ip'] in suspicious_ips and event['severity'] == 'INFO':
            event['severity'] = 'WARNING'
            if 'suspicious IP' not in event['message'].lower():
                event['message'] += f" (Suspicious IP: {ip_event_count[event['source_ip']]} events)"

    # Count events by severity
    threats = sum(1 for e in events if e['severity'] == 'CRITICAL')
    warnings = sum(1 for e in events if e['severity'] in ['HIGH', 'WARNING'])
    clean_events = sum(1 for e in events if e['severity'] == 'INFO')

    return {
        'total_events': len(events),
        'threats': threats,
        'warnings': warnings,
        'clean_events': clean_events,
        'events': events
    }


def parse_log_line(line: str) -> Dict[str, Any]:
    """
    Parse a single log line and detect threat type.

    Args:
        line: Single log line

    Returns:
        Dictionary with event details or None if line cannot be parsed
    """
    # Common log patterns
    timestamp_pattern = r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})'
    ip_pattern = r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'

    # Extract timestamp
    timestamp_match = re.search(timestamp_pattern, line)
    timestamp = timestamp_match.group(1) if timestamp_match else datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Extract IP address
    ip_match = re.search(ip_pattern, line)
    source_ip = ip_match.group(1) if ip_match else 'unknown'

    # Detect threat types
    threat_type = 'normal'
    severity = 'INFO'
    message = line.strip()

    line_lower = line.lower()

    # Failed login detection
    if any(keyword in line_lower for keyword in ['failed login', 'authentication failed', 'invalid password', 'failed password']):
        threat_type = 'failed_login'
        severity = 'HIGH'
        message = f"Failed login attempt from {source_ip}"

    # Port scan detection
    elif any(keyword in line_lower for keyword in ['port scan', 'scanning', 'syn scan', 'stealth scan']):
        threat_type = 'port_scan'
        severity = 'CRITICAL'
        message = f"Port scan detected from {source_ip}"

    # SQL injection detection
    elif any(keyword in line_lower for keyword in ['sql injection', "' or '1'='1", 'union select', 'drop table', '-- -']):
        threat_type = 'sql_injection'
        severity = 'CRITICAL'
        message = f"SQL injection attempt from {source_ip}"

    # Brute force detection
    elif any(keyword in line_lower for keyword in ['brute force', 'multiple failed', 'repeated attempts']):
        threat_type = 'brute_force'
        severity = 'CRITICAL'
        message = f"Brute force attack detected from {source_ip}"

    # Suspicious patterns
    elif any(keyword in line_lower for keyword in ['unauthorized', 'denied', 'blocked', 'suspicious']):
        threat_type = 'suspicious'
        severity = 'WARNING'
        message = f"Suspicious activity from {source_ip}"

    return {
        'timestamp': timestamp,
        'severity': severity,
        'source_ip': source_ip,
        'threat_type': threat_type,
        'message': message
    }
