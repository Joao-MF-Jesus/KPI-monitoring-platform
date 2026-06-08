def check_alerts(record):
    alerts = []
    if record.cpa > 100:
        alerts.append({"data": record.data, "source_sheet": record.source_sheet, "tipo": "CPA crítico", "descricao": f"CPA em R$ {record.cpa:.2f}, acima do limite de R$ 100.", "severidade": "Crítico"})
    if record.cpl > 30:
        alerts.append({"data": record.data, "source_sheet": record.source_sheet, "tipo": "CPL crítico", "descricao": f"CPL em R$ {record.cpl:.2f}, acima do limite de R$ 30.", "severidade": "Crítico"})
    if record.roi < 30:
        roi_display = max(record.roi, -100)
        alerts.append({"data": record.data, "source_sheet": record.source_sheet, "tipo": "ROI operacional", "descricao": f"ROI em {roi_display:.2f}%, abaixo do limite de 30%.", "severidade": "Operacional"})
    return alerts
