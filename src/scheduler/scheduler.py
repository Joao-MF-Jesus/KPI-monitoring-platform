from pathlib import Path
import logging
import time

from apscheduler.schedulers.background import BackgroundScheduler

from src.etl.load_data import run_etl


BASE_DIR = Path(__file__).resolve().parents[2]

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "etl.log"

excel_folder = BASE_DIR / "data" / "raw"

excel_files = list(excel_folder.glob("*.xlsx"))

if not excel_files:
    raise FileNotFoundError(
        "Nenhum arquivo Excel encontrado em data/raw"
    )

EXCEL_PATH = excel_files[0]


logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def scheduled_job():
    try:
        logging.info("Iniciando ETL automático.")
        logging.info(f"Arquivo monitorado: {EXCEL_PATH}")

        result = run_etl(EXCEL_PATH)

        if result:
            total_records, imported_sheets = result

            logging.info(f"Registros processados: {total_records}")
            logging.info(f"Abas processadas: {len(imported_sheets)}")

        logging.info("ETL executado com sucesso.")

    except Exception as error:
        logging.exception(f"Erro durante ETL automático: {error}")


scheduler = BackgroundScheduler()

scheduler.add_job(
    scheduled_job,
    "interval",
    minutes=10
)

scheduler.start()

print("Scheduler iniciado.")
print(f"Arquivo monitorado: {EXCEL_PATH}")
print(f"Logs em: {LOG_FILE}")
print("Intervalo: 10 minutos")
print("Pressione CTRL+C para encerrar.")

try:
    while True:
        time.sleep(1)

except (KeyboardInterrupt, SystemExit):
    scheduler.shutdown()
    print("Scheduler encerrado.")