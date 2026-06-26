// Modelo de pricing del worker. Alineado con src/config/taxConfig (modelo unico
// de OficiosPro): comision de plataforma 9,5% + IVA, con un minimo por atencion
// de $3.000 (sobre la comision neta). Todo medido en creditos ($1.000 = 1 credito).
//
// El especialista declara cuanto quiere recibir (payout). El cliente paga ese
// payout + la comision de plataforma. Servicios de emergencia aplican un recargo
// sobre el valor antes de calcular la comision.

export type WorkerPricingConfig = {
  customerCreditValueCLP: number;
  commissionRate: number;
  ivaRate: number;
  minimumCommissionCLP: number;
  emergencyMultiplier: number;
};

export const workerPricingConfig: WorkerPricingConfig = {
  customerCreditValueCLP: 1000,
  commissionRate: 0.095,
  ivaRate: 0.19,
  minimumCommissionCLP: 3000,
  emergencyMultiplier: 1.35,
};

export function normalizeMoney(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount);
}

// Comision de plataforma sobre un valor de servicio: 9,5% con minimo $3.000, mas IVA.
export function platformCommissionCLP(serviceValueCLP: number) {
  const net = Math.max(serviceValueCLP * workerPricingConfig.commissionRate, workerPricingConfig.minimumCommissionCLP);
  return Math.round(net * (1 + workerPricingConfig.ivaRate));
}

export function calculateWorkerClientCredits(specialistExpectedPayoutCLP: number, emergencyAvailable: boolean) {
  const payout = normalizeMoney(specialistExpectedPayoutCLP);
  const serviceValue = emergencyAvailable ? payout * workerPricingConfig.emergencyMultiplier : payout;
  const customerPrice = serviceValue + platformCommissionCLP(serviceValue);
  return Math.ceil(customerPrice / workerPricingConfig.customerCreditValueCLP);
}
