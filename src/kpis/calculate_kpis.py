def calculate_roi(lucro, investimento_ads):
    if investimento_ads == 0:
        return 0
    return (lucro / investimento_ads) * 100

def calculate_cpa(investimento_ads, vendas):
    if vendas == 0:
        return 0
    return investimento_ads / vendas

def calculate_cpl(investimento_ads, leads):
    if leads == 0:
        return 0
    return investimento_ads / leads

def calculate_margem(lucro, faturamento):
    if faturamento == 0:
        return 0
    return (lucro / faturamento) * 100
