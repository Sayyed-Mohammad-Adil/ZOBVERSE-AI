"""
ZOBVERSE AI Startup Banner & ASCII Art Generator.
Renders the Open-Code logo emblem in ASCII/ANSI form on backend startup.
"""

import sys
import logging

logger = logging.getLogger("uvicorn")

ASCII_BANNER = r"""
[38;2;63;103;249m         ▄▄▄▀▀▀▀▀▄▄▄                [0m
[38;2;63;103;249m     ▄ ▀▀▀▀▀▀▀▀▀ ▀▀▀▀▀▀▀▄▄▄            [1;36m___  ____  _____ _   _       _  ___  ____  [0m
[38;2;63;103;249m▄▄▀▀▀▄    ▀▀▀▀▀▀▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄      [1;36m/ _ \|  _ \| ____| \ | |     | |/ _ \| __ ) [0m
[38;2;43;78;212m▀▀▀▀▀▀▀▀▀▄▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀    [1;34m| | | | |_) |  _| |  \| |  _  | | | | |  _ \ [0m
[38;2;33;60;174m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀      ▀▀▀▀▀▀▀▀▀▀▀    [1;34m| |_| |  __/| |___| |\  | | |_| | |_| | |_) |[0m
[38;2;26;46;140m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀       ▀▀▀▀▀▀▀▀▀▀     [1;35m\___/|_|   |_____|_| \_|  \___/ \___/|____/ [0m
[38;2;20;35;112m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀        ▀▀▀▄▀▀▄▀▀    [38;2;100;116;139m─────────────────────────────────────────────[0m
[38;2;20;35;112m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀         ▀▀▀▀▀▀▀▀     [1;37m► System:     [38;2;59;130;246mZOBVERSE AI Platform v2.0[0m
[38;2;20;35;112m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀          ▀▀▀▀▀▀▀     [1;37m► Brand:      [38;2;147;197;253mOpen Code Ecosystem (Open-Code-logo.svg)[0m
[38;2;20;35;112m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀          ▀▀▀▀▀▀▀     [1;37m► Engine:     [38;2;34;197;94mFastAPI + AI Career Platform[0m
[38;2;20;35;112m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀          ▀▀▀▀▀▀▀     [1;37m► Vision:     [38;2;6;182;212mLight-OCR Neural Document Parser Active[0m
[38;2;20;35;112m ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                      [1;37m► Integrity:  [38;2;168;85;247mRule 2 Anti-Fabrication Enforced[0m
[38;2;33;60;174m         ▀▀▀▀▀▀▀                     [38;2;100;116;139m─────────────────────────────────────────────[0m
[38;2;63;103;249m             ▀▀▀                      [38;2;148;163;184mReady at http://0.0.0.0:8000 | Docs at /docs[0m
"""

def print_startup_banner():
    """Print Open Code / ZOBVERSE AI ASCII banner to stdout and logger on backend startup."""
    sys.stdout.write(ASCII_BANNER + "\n")
    sys.stdout.flush()
