from datetime import datetime
from sqlalchemy import Column, Date, DateTime, Float, Integer, String
from src.database.connection import Base

class KPIRecord(Base):
    __tablename__ = "kpi_records"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(Date, index=True)
    source_sheet = Column(String, index=True)
    faturamento = Column(Float)
    lucro = Column(Float)
    roi = Column(Float)
    cpa = Column(Float)
    cpl = Column(Float)
    leads = Column(Integer)
    vendas = Column(Integer)
    margem = Column(Float)
    investimento_ads = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(Date, index=True)
    source_sheet = Column(String, index=True)
    tipo = Column(String)
    descricao = Column(String)
    severidade = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
