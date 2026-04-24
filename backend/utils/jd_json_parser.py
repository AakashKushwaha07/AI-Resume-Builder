import re
import spacy
from typing import Dict, Any, List, Tuple

# Load spaCy model for NLP
nlp = spacy.load("en_core_web_sm")


def _normalize(text: str) -> str:
    text = (text or "").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _find_section(text: str, header: str) -> str:
    """
    Returns the content after `header:` until the next big header-like line.
    Works for paragraphs (not only bullets).
    """
    lines = text.splitlines()
    header_re = re.compile(rf"^\s*{re.escape(header)}\s*:?\s*$", re.I)

    start = -1
    for i, line in enumerate(lines):
        if header_re.match(line.strip()):
            start = i + 1
            break

    if start == -1:
        return ""

    collected = []
    for j in range(start, len(lines)):
        ln = lines[j].strip()

        # stop at next section heading
        if re.match(r"^[A-Z][A-Za-z ]{2,30}:\s*$", ln):
            break

        collected.append(lines[j])

    return "\n".join(collected).strip()


def _extract_experience_years(text: str) -> float:
    t = text.lower()

    # months range like 0–6 months / 0-6 months
    m = re.search(r"(\d+)\s*[–-]\s*(\d+)\s*months?", t)
    if m:
        # fresher => treat minimum as years
        return float(int(m.group(1))) / 12.0

    # direct years like 2 years, 3+ yrs
    m = re.search(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs|yr)\b", t)
    if m:
        return float(m.group(1))

    # single months like 6 months
    m = re.search(r"(\d+)\s*months?\b", t)
    if m:
        return float(int(m.group(1))) / 12.0

    return 0.0


def _clean_skill(s: str) -> str:
    s = s.strip(" .;:-\t")
    s = re.sub(r"\s+", " ", s)
    return s


def _dedupe_keep_order(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for x in items:
        key = x.lower()
        if key and key not in seen:
            seen.add(key)
            out.append(x)
    return out


def _split_slash_or(s: str) -> List[str]:
    # Split patterns like "JavaScript / TypeScript" or "Redux or Context API"
    parts = re.split(r"\s*/\s*|\s+or\s+|\s*\|\s*", s, flags=re.I)
    return [_clean_skill(p) for p in parts if _clean_skill(p)]


def _extract_skills_from_required_section(section: str) -> Tuple[List[str], List[str]]:
    """
    Extracts skills from paragraph-style 'Required Skills' section.
    Returns (mandatory_skills, soft_skills)
    """
    mandatory = []
    soft = []

    text = section.replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()

    # Split into sentences-ish chunks
    chunks = re.split(r"\.\s+|\;\s+|\n+", text)
    chunks = [c.strip() for c in chunks if c.strip()]

    for c in chunks:
        lc = c.lower()

        # Soft skills bucket
        if "problem-solving" in lc or "willingness to learn" in lc or "motivat" in lc:
            # extract phrases we recognize
            if "problem-solving" in lc:
                soft.append("Problem solving")
            if "willingness to learn" in lc:
                soft.append("Willingness to learn")
            continue

        # Patterns:
        # "Basic understanding of JavaScript / TypeScript and React fundamentals."
        m = re.search(r"understanding of (.+)", lc)
        if m:
            raw = c.split("of", 1)[1]
            # often contains "... and ..."
            raw = raw.replace(" and ", ", ")
            for part in raw.split(","):
                for s in _split_slash_or(part):
                    mandatory.append(s)
            continue

        # "Familiarity with running React Native applications..."
        if "familiarity with" in lc:
            if "react native" in lc:
                mandatory.append("React Native")
            if "android" in lc:
                mandatory.append("Android")
            if "ios" in lc:
                mandatory.append("iOS")
            continue

        # "Basic knowledge of API integration."
        if "api integration" in lc:
            mandatory.append("API integration")
            continue

        # "state management ... Redux or Context API"
        if "state management" in lc:
            mandatory.append("State management")
            if "redux" in lc:
                mandatory.append("Redux")
            if "context api" in lc:
                mandatory.append("Context API")
            continue

        # "performance optimization"
        if "performance" in lc and "optimization" in lc:
            mandatory.append("Performance optimization")
            mandatory.append("Mobile app lifecycle")
            continue

        # "testing tools such as Jest"
        if "jest" in lc:
            mandatory.append("Jest")
            mandatory.append("Unit testing")
            continue

    # Normalize names a bit
    # React fundamentals -> React
    normalized = []
    for s in mandatory:
        s2 = _clean_skill(s)
        s2_lower = s2.lower()
        if "react fundamentals" in s2_lower:
            normalized.append("React")
        elif s2_lower in ["javascript", "js"]:
            normalized.append("JavaScript")
        elif s2_lower in ["typescript", "ts"]:
            normalized.append("TypeScript")
        else:
            normalized.append(s2)

    return _dedupe_keep_order(normalized), _dedupe_keep_order(soft)


def parse_jd_to_json(job_description: str) -> Dict[str, Any]:
    text = _normalize(job_description)

    # ---- Experience ----
    min_exp_years = _extract_experience_years(text)

    # ---- Section-based extraction (if exists) ----
    required_section = _find_section(text, "Required Skills")
    mandatory_section, soft_section = _extract_skills_from_required_section(required_section)

    # ---- Global extraction (fallback for unstructured JD) ----
    global_skills = extract_skills_from_text(text)

    # ---- Merge both ----
    mandatory = list(set(mandatory_section + global_skills))
    soft = soft_section

    # ---- Basic soft skill detection ----
    if "communication" in text.lower():
        soft.append("Communication")
    if "team" in text.lower():
        soft.append("Teamwork")
    if "problem" in text.lower():
        soft.append("Problem solving")

    soft = _dedupe_keep_order(soft)

    return {
        "min_experience": float(min_exp_years),
        "mandatory_skills": mandatory,
        "preferred_skills": [],
        "soft_skills": soft,
        "education_criteria": [],
        "project_requirement": False
    }
SKILL_DB = [
    # Programming Languages
    "python", "java", "c++", "c#", "javascript", "typescript", "node.js",
    "react", "angular", "vue", "html", "css", "php", "ruby", "go", "rust",
    "kotlin", "swift", "scala", "perl", "bash", "powershell",

    # Frameworks & Libraries
    "spring", "django", "flask", "fastapi", "express", "laravel", "rails",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "keras",
    "opencv", "matplotlib", "seaborn", "plotly",

    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "oracle", "sqlite", "cassandra", "dynamodb",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "gitlab ci", "github actions", "ansible", "puppet", "chef",

    # Tools & Technologies
    "git", "linux", "windows", "mac", "unix", "rest api", "graphql",
    "microservices", "agile", "scrum", "kanban",

    # Data & Analytics
    "machine learning", "data analysis", "statistics", "big data",
    "hadoop", "spark", "tableau", "power bi", "excel", "r", "sas",

    # Networking
    "tcp/ip", "dns", "http", "https", "tls", "ssl", "ftp", "vpn", "ipsec",
    "wireshark", "nmap", "ping", "traceroute", "mtr", "telnet", "nslookup",

    # OS
    "linux", "windows", "mac", "unix", "freebsd",

    # Auth
    "ldap", "saml", "oauth", "jwt"
]

def extract_skills_from_text(jd_text):
    """Extract skills using both predefined matching and NLP"""
    skills = set()
    text_lower = jd_text.lower()

    # First, check for exact matches with predefined skills
    for skill in SKILL_DB:
        if skill in text_lower:
            skills.add(skill)

    # Use NLP to extract additional potential skills
    doc = nlp(jd_text)

    # Extract noun phrases that might be skills (more selective)
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.lower().strip()
        # Filter out common words, names, and short/irrelevant phrases
        if (len(chunk_text.split()) <= 2 and  # Max 2 words
            len(chunk_text) > 2 and
            not any(word in chunk_text for word in ['experience', 'role', 'responsibility', 'team', 'we', 'you', 'this', 'the', 'and', 'or', 'requirements', 'position', 'scientist', 'preferred', 'skills', 'knowledge', 'understanding', 'ability', 'strong'])):
            # Check if it looks like a technical skill
            if any(keyword in chunk_text for keyword in [
                'programming', 'language', 'framework', 'tool', 'database',
                'cloud', 'platform', 'system', 'software', 'development',
                'analysis', 'learning', 'data', 'web', 'mobile', 'api',
                'machine', 'deep', 'neural', 'algorithm', 'model'
            ]) or chunk.root.pos_ in ['NOUN', 'PROPN']:
                # Additional filter: must contain at least one tech-related word
                tech_indicators = ['python', 'java', 'sql', 'data', 'machine', 'learning', 'web', 'api', 'cloud', 'database', 'framework', 'tool', 'statistics', 'analysis']
                if any(indicator in chunk_text for indicator in tech_indicators):
                    skills.add(chunk_text)

    return list(skills)