import type { HookFetcher } from '@lib/commerce/utils/types'
import type { SwrOptions } from '@lib/commerce/utils/use-data'
import useCommerceCart, { CartInput } from '@lib/commerce/cart/use-cart'
import type { Cart } from '../api/cart'

const defaultOpts = {
  url: '/api/bigcommerce/cart',
  method: 'GET',
}

export type { Cart }

export const fetcher: HookFetcher<Cart | null, CartInput> = (
  options,
  { cartId },
  fetch
) => {
  return cartId ? fetch({ ...defaultOpts, ...options }) : null
}

export function extendHook(
  customFetcher: typeof fetcher,
  swrOptions?: SwrOptions<Cart | null, CartInput>
) {
  const useCart = () => {
    const cart = useCommerceCart(defaultOpts, [], customFetcher, {
      revalidateOnFocus: false,
      ...swrOptions,
    })

    // Uses a getter to only calculate the prop when required
    // cart.data is also a getter and it's better to not trigger it early
    Object.defineProperty(cart, 'isEmpty', {
      get() {
        return Object.values(cart.data?.line_items ?? {}).every(
          (items) => !items.length
        )
      },
      set: (x) => x,
    })

    return cart
  }

  useCart.extend = extendHook

  return useCart
}

export default extendHook(fetcher)