from flask import Flask, request, jsonify
import requests as _reqs
import time
from collections import OrderedDict
from bs4 import BeautifulSoup
import warnings
import os

warnings.filterwarnings("ignore")

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

_H1 = "https://www.smcinsurance.com/"
_H2 = "https://www.smcinsurance.com/central/centralcall/CallReqWithHeader"
_H3 = "https://vahanx.in/rc-search/"
_H4 = {"User-Agent": "okhttp/4.9.2"}
_H5 = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
    "Referer": "https://vahanx.in/rc-search"
}

def _f1(reg):
    sess = _reqs.Session()
    sess.headers.update(_H4)
    sess.verify = False
    try:
        sess.get(_H1, timeout=15)
        r = sess.post(_H2, json={"url": "GetVaahanDetailsByVehicleNo", "props": [reg, "", "0"]}, timeout=15)
        return r.json()
    except:
        return {}

def _f2(reg):
    try:
        r = _reqs.get(_H3 + reg, headers=_H5, timeout=10)
        if r.status_code != 200:
            return {}
        soup = BeautifulSoup(r.text, 'html.parser')
        def g(label):
            try:
                div = soup.find("span", string=label).find_parent("div")
                return div.find("p").get_text(strip=True) or ""
            except:
                return ""
        return {k: g(k) for k in ["Owner Name", "Father's Name", "Owner Serial No",
            "Model Name", "Maker Model", "Vehicle Class", "Fuel Type", "Fuel Norms",
            "Registration Date", "Insurance Company", "Insurance No", "Insurance Expiry",
            "Insurance Upto", "Fitness Upto", "Tax Upto", "PUC No", "PUC Upto",
            "Financier Name", "Registered RTO", "Address", "City Name", "Phone"]}
    except:
        return {}

def fetch(reg):
    start = time.time()
    reg = reg.upper().strip()
    out = OrderedDict([
        ("success", False),
        ("registration_number", reg),
        ("response_time", 0),
        ("error", ""),
        ("owner", OrderedDict([("name", ""), ("father_name", ""), ("serial_no", "")])),
        ("vehicle", OrderedDict([("manufacturer", ""), ("model", ""), ("maker_model", ""),
            ("class", ""), ("type", ""), ("fuel", ""), ("fuel_norms", ""),
            ("cc", 0), ("seating", 0), ("commercial", False), ("variant", "")])),
        ("identification", OrderedDict([("chassis", ""), ("engine", "")])),
        ("registration", OrderedDict([("date", ""), ("rto", ""), ("rto_code", ""), ("authority", "")])),
        ("insurance", OrderedDict([("company", ""), ("policy_no", ""), ("valid_upto", ""), ("expired", False)])),
        ("puc", OrderedDict([("no", ""), ("valid_upto", "")])),
        ("fitness", OrderedDict([("fitness_upto", ""), ("tax_upto", "")])),
        ("financier", OrderedDict([("name", "")])),
        ("address", OrderedDict([("present", ""), ("permanent", ""), ("city", ""), ("pincode", "")])),
        ("rto_contact", OrderedDict([("phone", "")])),
    ])
    try:
        d1 = _f1(reg)
        d2 = _f2(reg)
        if d1.get("statusCode") == 200 and d1.get("response"):
            v = d1["response"]
            out["success"] = True
            out["owner"]["name"] = v.get("owner") or ""
            out["owner"]["father_name"] = v.get("ownerFatherName") or ""
            out["vehicle"]["manufacturer"] = v.get("manufacturer") or ""
            out["vehicle"]["model"] = v.get("vehicle") or ""
            out["vehicle"]["class"] = v.get("vehicleClass") or ""
            out["vehicle"]["type"] = v.get("vehicleType") or ""
            out["vehicle"]["fuel"] = v.get("fuelType") or ""
            out["vehicle"]["cc"] = v.get("cubicCapacity") or 0
            out["vehicle"]["seating"] = v.get("seatCapacity") or 0
            out["vehicle"]["commercial"] = v.get("isCommercial", False)
            out["vehicle"]["variant"] = v.get("variant") or ""
            out["identification"]["chassis"] = (v.get("chassis") or "").replace(" ", "")
            out["identification"]["engine"] = v.get("engine") or ""
            out["registration"]["date"] = v.get("regDate") or ""
            out["registration"]["rto"] = (v.get("rtoData") or {}).get("rtoName") or ""
            out["registration"]["rto_code"] = v.get("rtoCode") or ""
            out["registration"]["authority"] = v.get("regAuthority") or ""
            out["insurance"]["company"] = v.get("insuranceCompanyName") or ""
            out["insurance"]["policy_no"] = v.get("insurancePolicyNumber") or ""
            out["insurance"]["valid_upto"] = v.get("insuranceUpto") or ""
            out["insurance"]["expired"] = v.get("insuranceExpired", False)
            out["puc"]["no"] = v.get("puccNumber") or ""
            out["puc"]["valid_upto"] = v.get("puccValidUpto") or ""
            out["financier"]["name"] = v.get("financerName") or ""
            out["address"]["present"] = v.get("presentAddress") or ""
            out["address"]["permanent"] = v.get("permAddress") or ""
            out["address"]["pincode"] = v.get("pincode") or ""
        else:
            out["error"] = "Vehicle not found"
            out["success"] = False
        if d2:
            if d2.get("Owner Serial No"): out["owner"]["serial_no"] = d2["Owner Serial No"]
            if d2.get("Maker Model"): out["vehicle"]["maker_model"] = d2["Maker Model"]
            if d2.get("Fuel Norms"): out["vehicle"]["fuel_norms"] = d2["Fuel Norms"]
            if d2.get("Fitness Upto"): out["fitness"]["fitness_upto"] = d2["Fitness Upto"]
            if d2.get("Tax Upto"): out["fitness"]["tax_upto"] = d2["Tax Upto"]
            if d2.get("City Name"): out["address"]["city"] = d2["City Name"]
            if d2.get("Phone"): out["rto_contact"]["phone"] = d2["Phone"]
            if not out["owner"]["name"] and d2.get("Owner Name"): out["owner"]["name"] = d2["Owner Name"]
            if not out["owner"]["father_name"] and d2.get("Father's Name"): out["owner"]["father_name"] = d2["Father's Name"]
            if not out["vehicle"]["manufacturer"] and d2.get("Model Name"): out["vehicle"]["manufacturer"] = d2["Model Name"]
            if not out["vehicle"]["class"] and d2.get("Vehicle Class"): out["vehicle"]["class"] = d2["Vehicle Class"]
            if not out["vehicle"]["fuel"] and d2.get("Fuel Type"): out["vehicle"]["fuel"] = d2["Fuel Type"]
            if not out["registration"]["date"] and d2.get("Registration Date"): out["registration"]["date"] = d2["Registration Date"]
            if not out["insurance"]["company"] and d2.get("Insurance Company"): out["insurance"]["company"] = d2["Insurance Company"]
            if not out["insurance"]["policy_no"] and d2.get("Insurance No"): out["insurance"]["policy_no"] = d2["Insurance No"]
            if not out["insurance"]["valid_upto"] and d2.get("Insurance Upto"): out["insurance"]["valid_upto"] = d2["Insurance Upto"]
            if not out["puc"]["no"] and d2.get("PUC No"): out["puc"]["no"] = d2["PUC No"]
            if not out["puc"]["valid_upto"] and d2.get("PUC Upto"): out["puc"]["valid_upto"] = d2["PUC Upto"]
            if not out["financier"]["name"] and d2.get("Financier Name"): out["financier"]["name"] = d2["Financier Name"]
            if not out["registration"]["rto"] and d2.get("Registered RTO"): out["registration"]["rto"] = d2["Registered RTO"]
            if not out["address"]["present"] and d2.get("Address"): out["address"]["present"] = d2["Address"]
    except Exception as e:
        out["error"] = str(e)
        out["success"] = False
    out["response_time"] = round(time.time() - start, 2)
    return out


@app.after_request
def cors(r):
    r.headers.update({"Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"})
    return r


@app.route("/")
def index():
    return jsonify({"service": "Vehicle Information API", "version": "2.0"})


@app.route("/api/vehicle", methods=["GET", "POST", "OPTIONS"])
@app.route("/rc", methods=["GET", "POST", "OPTIONS"])
def handler():
    if request.method == "OPTIONS":
        return "", 204
    if request.method == "POST":
        d = request.get_json(silent=True) or {}
        v = (d.get("vehicle_number") or d.get("vehicle") or d.get("rc") or "").upper().strip()
    else:
        v = (request.args.get("vehicle") or request.args.get("vehicle_number") or request.args.get("rc") or "").upper().strip()
    if not v or len(v) < 4 or len(v) > 20:
        return jsonify({"success": False, "error": "Invalid vehicle number"}), 400
    r = fetch(v)
    return jsonify(r), (200 if r["success"] else 400)


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "Vehicle Info API"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
