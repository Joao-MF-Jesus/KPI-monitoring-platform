from pathlib import Path
from src.etl.load_data import run_etl

def run_etl_job():
    base_dir = Path(__file__).resolve().parents[2]
    excel_folder = base_dir / "data" / "raw"
    excel_files = list(excel_folder.glob("*.xlsx"))
    if not excel_files:
        raise FileNotFoundError("Nenhum arquivo Excel encontrado em data/raw")
    excel_path = excel_files[0]
    run_etl(excel_path)
