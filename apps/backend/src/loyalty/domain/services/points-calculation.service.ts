import { LoyaltyRules } from '../ports/loyalty-config-repository.port'

export class PointsCalculationService {
  /**
   * Calcula puntos a otorgar por un pedido completado.
   * Regla base: orderTotal * pointsPerEuro, redondeado hacia abajo.
   */
  static calculatePointsForOrder(orderTotal: number, rules: LoyaltyRules): number {
    if (!rules.isEnabled || orderTotal <= 0) return 0
    return Math.floor(orderTotal * rules.pointsPerEuro)
  }

  /**
   * Calcula el descuento monetario equivalente a N puntos.
   * pointValueCents: cuántos céntimos vale un punto (ej: 1.0 = 0.01€ por punto)
   */
  static calculateDiscountValue(points: number, rules: LoyaltyRules): number {
    if (points <= 0) return 0
    return Math.round(points * rules.pointValueCents) / 100
  }

  /**
   * Cuántos puntos se necesitan para obtener un descuento de N euros.
   */
  static pointsNeededForDiscount(discountEuros: number, rules: LoyaltyRules): number {
    if (rules.pointValueCents <= 0) return Infinity
    return Math.ceil((discountEuros * 100) / rules.pointValueCents)
  }
}
