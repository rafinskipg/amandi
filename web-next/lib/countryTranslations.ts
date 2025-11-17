import type { CountryCode } from './countries'

export interface CountryTranslations {
  seoIntro: {
    title: string
    intro: string
    benefits: string[]
  }
  checkout: {
    buy: string
    subscribe: string
  }
  preorden?: {
    boxSelectorTitle: string
  }
}

const baseTranslations: Record<CountryCode, CountryTranslations> = {
  gb: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in the UK',
      intro: 'We deliver fresh, tree-ripened avocados directly from our farm in Asturias, Spain to your door in the United Kingdom. No cold storage, no artificial ripening—just naturally grown avocados that arrive ready to enjoy.',
      benefits: [
        'Direct shipping from Spain to UK',
        '3-5 day delivery',
        'No customs hassles - EU origin',
        'Perfect for UK kitchens'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  fi: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in Finland',
      intro: 'Bring the taste of Asturias to Finland. Our organic avocados are shipped directly from our farm to your home in Finland. Tree-ripened and naturally grown, they arrive fresh and ready to enjoy.',
      benefits: [
        'Direct shipping from Spain to Finland',
        '5-7 day delivery',
        'Perfect for Finnish cuisine',
        'No cold storage, natural ripening'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  se: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in Sweden',
      intro: 'Experience the difference of tree-ripened avocados from Asturias, delivered fresh to Sweden. Our organic avocados are grown without cold storage or artificial processes.',
      benefits: [
        'Direct shipping from Spain to Sweden',
        '5-7 day delivery',
        'Perfect for Swedish kitchens',
        'Naturally ripened fruit'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  no: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in Norway',
      intro: 'Fresh organic avocados from Asturias, Spain, delivered to Norway. Our avocados are tree-ripened and shipped directly from our farm—no cold storage, no artificial ripening.',
      benefits: [
        'Direct shipping from Spain to Norway',
        '5-7 day delivery',
        'Perfect for Norwegian cuisine',
        'Naturally grown and ripened'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  dk: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in Denmark',
      intro: 'Get fresh, organic avocados delivered from our farm in Asturias to Denmark. Tree-ripened and naturally grown, our avocados arrive ready to enjoy in your Danish kitchen.',
      benefits: [
        'Direct shipping from Spain to Denmark',
        '4-6 day delivery',
        'Perfect for Danish cuisine',
        'No artificial processes'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  nl: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in the Netherlands',
      intro: 'Fresh organic avocados from Asturias, delivered to the Netherlands. Our tree-ripened avocados are shipped directly from our farm—no cold storage, naturally ripened.',
      benefits: [
        'Direct shipping from Spain to Netherlands',
        '3-5 day delivery',
        'Perfect for Dutch kitchens',
        'Naturally grown fruit'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  de: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in Germany',
      intro: 'Premium organic avocados from Asturias, Spain, delivered fresh to Germany. Our avocados are tree-ripened and shipped directly—no cold storage, no artificial ripening processes.',
      benefits: [
        'Direct shipping from Spain to Germany',
        '3-5 day delivery',
        'Perfect for German cuisine',
        'Naturally ripened'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  fr: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in France',
      intro: 'Fresh organic avocados from Asturias, delivered to France. Our tree-ripened avocados are grown naturally and shipped directly from our farm—no cold storage, no artificial processes.',
      benefits: [
        'Direct shipping from Spain to France',
        '2-4 day delivery',
        'Perfect for French cuisine',
        'Naturally grown and ripened'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  be: {
    seoIntro: {
      title: 'Order Premium Organic Avocados Online in Belgium',
      intro: 'Get fresh, organic avocados delivered from our farm in Asturias to Belgium. Tree-ripened and naturally grown, our avocados arrive ready to enjoy.',
      benefits: [
        'Direct shipping from Spain to Belgium',
        '3-5 day delivery',
        'Perfect for Belgian kitchens',
        'No artificial processes'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscription'
    },
    preorden: {
      boxSelectorTitle: 'Choose your box'
    }
  },
  es: {
    seoIntro: {
      title: 'Comprar Aguacates Ecológicos Online en España',
      intro: 'Aguacates ecológicos frescos de nuestra finca en Asturias, entregados directamente en España. Nuestros aguacates se recolectan cuando el árbol decide—sin cámaras, sin procesos artificiales.',
      benefits: [
        'Envío directo desde Asturias',
        'Entrega en 2-3 días',
        'Perfectos para la cocina española',
        'Crecidos y madurados naturalmente'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=suscripcion'
    },
    preorden: {
      boxSelectorTitle: 'Elige tu caja'
    }
  },
  pt: {
    seoIntro: {
      title: 'Comprar Abacates Ecológicos Online em Portugal',
      intro: 'Abacates ecológicos frescos da nossa quinta em Asturias, entregues diretamente em Portugal. Os nossos abacates são colhidos quando a árvore decide—sem câmaras, sem processos artificiais.',
      benefits: [
        'Envio direto desde Asturias',
        'Entrega em 2-4 dias',
        'Perfeitos para a cozinha portuguesa',
        'Crescidos e amadurecidos naturalmente'
      ]
    },
    checkout: {
      buy: '/checkout',
      subscribe: '/checkout?type=subscricao'
    },
    preorden: {
      boxSelectorTitle: 'Escolha a sua caixa'
    }
  }
}

// Export with type safety
export const countryTranslations: Record<CountryCode, CountryTranslations> = baseTranslations

// Helper to get country translation with fallback
export const getCountryTranslation = (countryCode: CountryCode): CountryTranslations => {
  return countryTranslations[countryCode] || countryTranslations.gb
}
