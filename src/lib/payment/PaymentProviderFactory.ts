import type { PaymentProvider as PaymentProviderType } from './interfaces/types'
import { PaymentProvider } from './interfaces/PaymentProvider'

export class PaymentProviderFactory {
  private static providers = new Map<PaymentProviderType, () => PaymentProvider>()

  /**
   * Register a payment provider
   */
  static registerProvider(
    providerType: PaymentProviderType,
    providerFactory: () => PaymentProvider
  ): void {
    this.providers.set(providerType, providerFactory)
  }

  /**
   * Create payment provider instance
   */
  static createProvider(providerType: PaymentProviderType): PaymentProvider {
    const providerFactory = this.providers.get(providerType)
    
    if (!providerFactory) {
      throw new Error(`Payment provider '${providerType}' not registered`)
    }

    const provider = providerFactory()
    
    if (!provider.validateConfig()) {
      throw new Error(`Payment provider '${providerType}' configuration is invalid`)
    }

    return provider
  }

  /**
   * Get all available providers
   */
  static getAvailableProviders(): PaymentProviderType[] {
    return Array.from(this.providers.keys())
  }

  /**
   * Get available providers for user/region
   */
  static getAvailableProvidersForUser(userRegion?: string): PaymentProviderType[] {
    const availableProviders: PaymentProviderType[] = []

    for (const [providerType, providerFactory] of this.providers) {
      try {
        const provider = providerFactory()
        if (provider.validateConfig() && provider.isAvailableForUser(userRegion)) {
          availableProviders.push(providerType)
        }
      } catch (error) {
        console.warn(`Provider ${providerType} not available:`, error)
      }
    }

    return availableProviders
  }

  /**
   * Check if provider is registered and available
   */
  static isProviderAvailable(providerType: PaymentProviderType): boolean {
    try {
      const provider = this.createProvider(providerType)
      return provider.validateConfig()
    } catch {
      return false
    }
  }

  /**
   * Get recommended provider for user/region
   */
  static getRecommendedProvider(userRegion?: string): PaymentProviderType | null {
    const availableProviders = this.getAvailableProvidersForUser(userRegion)
    
    if (availableProviders.length === 0) {
      return null
    }

    // Prioritize based on region
    if (userRegion === 'NZ' && availableProviders.includes('poli')) {
      return 'poli'
    }

    // Default to stripe if available
    if (availableProviders.includes('stripe')) {
      return 'stripe'
    }

    // Return first available provider
    return availableProviders[0]
  }
}