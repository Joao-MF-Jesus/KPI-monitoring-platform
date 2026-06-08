from pathlib import Path

from src.database.connection import engine
from src.database.models import Base
from src.etl.load_data import run_etl


def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":

    excel_folder = Path("data/raw")

    excel_files = list(excel_folder.glob("*.xlsx"))

    if not excel_files:
        raise FileNotFoundError(
            "Nenhum arquivo Excel encontrado em data/raw"
        )

    excel_path = excel_files[0]

    reset_database()

    run_etl(excel_path)

    print("Banco recriado com sucesso.")
    print("Excel integrado ao pipeline ETL com sucesso.")
