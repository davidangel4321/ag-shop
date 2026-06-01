import React, { useState, useMemo } from 'react'
import { Search, ShoppingCart, X, CheckCircle, User, MapPin, Phone, CreditCard, Banknote, Tag, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CartItem from '../components/CartItem'
import { formatCOP } from '../utils/format'
import { generateReceipt, generateShippingLabel } from '../utils/pdf'

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'Daviplata', 'Contra entrega']

export default function NewSale() {
  const { products, addSale } = useApp()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [variantPicker, setVariantPicker] = useState(null)
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', city: '' })
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [discount, setDiscount] = useState(0)
  const [shippingReal, setShippingReal] = useState(0)
  const [shippingCustomer, setShippingCustomer] = useState(0)
  const [confirming, setConfirming] = useState(false)

  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return products.filter(p =>
      p.stock > 0 &&
      (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    ).slice(0, 6)
  }, [search, products])

  function handleAddProduct(product) {
    if (product.variants && product.variants.length > 0) {
      setVariantPicker(product)
      return
    }
    addToCart(product, null)
  }

  function addToCart(product, variantSize) {
    const cartKey = `${product.id}_${variantSize || ''}`
    const maxStock = variantSize
      ? (product.variants.find(v => v.size === variantSize)?.stock || 0)
      : product.stock

    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) {
        if (existing.qty >= maxStock) {
          toast.error('No hay más stock disponible')
          return prev
        }
        return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, {
        cartKey,
        productId: product.id,
        variantSize: variantSize || null,
        sku: product.sku,
        name: product.name,
        price: product.salePrice,
        cost: product.costPrice,
        qty: 1,
        maxStock,
      }]
    })
    setSearch('')
    setVariantPicker(null)
    toast.success(`${product.name}${variantSize ? ` (${variantSize})` : ''} agregado`)
  }

  function updateQty(cartKey, qty) {
    if (qty <= 0) return removeFromCart(cartKey)
    setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty } : i))
  }

  function removeFromCart(cartKey) {
    setCart(prev => prev.filter(i => i.cartKey !== cartKey))
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingSubsidy = Math.max(0, Number(shippingReal) - Number(shippingCustomer))
  const total = Math.max(0, subtotal - Number(discount) + Number(shippingCustomer))

  async function handleConfirm() {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    if (!customer.name.trim()) {
      toast.error('El nombre del cliente es requerido')
      return
    }
    if (!customer.city.trim()) {
      toast.error('La ciudad es requerida')
      return
    }

    setConfirming(true)
    try {
      const saleData = {
        customer,
        items: cart,
        subtotal,
        discount: Number(discount),
        shippingReal: Number(shippingReal),
        shippingCustomer: Number(shippingCustomer),
        shippingSubsidy,
        total,
        paymentMethod,
      }
      const sale = await addSale(saleData)

      // Generate PDFs
      await generateReceipt(sale)
      await generateShippingLabel(sale)

      toast.success(`¡Venta ${sale.id} registrada! PDFs generados.`, { duration: 5000 })
      navigate('/sales')
    } catch (err) {
      console.error(err)
      toast.error('Error al procesar la venta')
    } finally {
      setConfirming(false)
    }
  }

  const custField = (key) => ({
    value: customer[key],
    onChange: e => setCustomer(c => ({ ...c, [key]: e.target.value })),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Nueva Venta</h1>
        <p className="text-gray-500 text-sm mt-1">Busca productos y completa la información del cliente</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: product search + cart */}
        <div className="xl:col-span-2 space-y-4">
          {/* Product search */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Search size={18} className="text-primary-600" />
              Buscar Productos
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {searchResults.map(product => (
                  <div key={product.id}>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {product.photo
                          ? <img src={product.photo} alt="" className="w-full h-full object-cover" />
                          : <span className="text-xs text-gray-400">IMG</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          {product.sku} •{' '}
                          {product.variants && product.variants.length > 0
                            ? `${product.variants.length} tallas`
                            : `Stock: ${product.stock}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-primary-700">{formatCOP(product.salePrice)}</p>
                        {product.variants && product.variants.length > 0 && (
                          <p className="text-xs text-gray-400">Seleccionar talla</p>
                        )}
                      </div>
                    </button>

                    {/* Variant picker inline */}
                    {variantPicker?.id === product.id && (
                      <div className="px-4 pb-3 bg-primary-50 border-t border-primary-100">
                        <p className="text-xs font-semibold text-primary-700 mb-2 pt-2">Selecciona la talla:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.variants.filter(v => v.stock > 0).map((v, i) => (
                            <button
                              key={i}
                              onClick={() => addToCart(product, v.size)}
                              className="px-3 py-1.5 rounded-lg border-2 border-primary-300 bg-white hover:bg-primary-100 text-sm font-semibold text-primary-700 transition-colors"
                            >
                              {v.size} <span className="text-xs font-normal text-gray-400">({v.stock})</span>
                            </button>
                          ))}
                          {product.variants.every(v => v.stock === 0) && (
                            <p className="text-xs text-red-500">Sin stock en ninguna talla</p>
                          )}
                        </div>
                        <button onClick={() => setVariantPicker(null)} className="text-xs text-gray-400 mt-2 hover:text-gray-600">Cancelar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {search && searchResults.length === 0 && (
              <p className="text-gray-400 text-sm mt-2 text-center py-4">No se encontraron productos con stock</p>
            )}
          </div>

          {/* Cart */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary-600" />
              Carrito
              {cart.length > 0 && (
                <span className="ml-auto badge bg-primary-100 text-primary-700">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
              )}
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Carrito vacío</p>
                <p className="text-xs mt-1">Busca y selecciona productos</p>
              </div>
            ) : (
              <div>
                {cart.map(item => (
                  <CartItem
                    key={item.cartKey}
                    item={item}
                    onQtyChange={updateQty}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: customer info + summary */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-primary-600" />
              Datos del Cliente
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nombre *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-8" placeholder="María García" {...custField('name')} />
                </div>
              </div>
              <div>
                <label className="label">Celular</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-8" placeholder="3101234567" type="tel" {...custField('phone')} />
                </div>
              </div>
              <div>
                <label className="label">Dirección</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-8" placeholder="Cra 10 # 20-30" {...custField('address')} />
                </div>
              </div>
              <div>
                <label className="label">Ciudad *</label>
                <input className="input" placeholder="Bogotá" {...custField('city')} />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-primary-600" />
              Método de Pago
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    paymentMethod === m
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {m === 'Efectivo' ? <span className="flex items-center justify-center gap-1"><Banknote size={14}/>{m}</span> : m}
                </button>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Resumen del Pedido</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCOP(subtotal)}</span>
              </div>

              {/* Discount */}
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-gray-400 shrink-0" />
                <input
                  className="input text-xs py-1"
                  type="number"
                  min="0"
                  max={subtotal}
                  placeholder="Descuento ($)"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
              </div>

              {Number(discount) > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Descuento</span>
                  <span className="font-semibold">- {formatCOP(discount)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="border-t border-gray-100 pt-2 pb-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2">
                  <Truck size={13} />
                  Costo de envío
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Costo real</label>
                    <input
                      className="input text-xs py-1"
                      type="number"
                      min="0"
                      placeholder="$0"
                      value={shippingReal}
                      onChange={e => setShippingReal(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Asume cliente</label>
                    <input
                      className="input text-xs py-1"
                      type="number"
                      min="0"
                      placeholder="$0"
                      value={shippingCustomer}
                      onChange={e => setShippingCustomer(e.target.value)}
                    />
                  </div>
                </div>
                {shippingSubsidy > 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    Subsidio tienda: {formatCOP(shippingSubsidy)}
                  </p>
                )}
                {Number(shippingCustomer) > 0 && (
                  <div className="flex justify-between text-blue-600 text-xs mt-1">
                    <span>Envío cobrado al cliente</span>
                    <span className="font-semibold">+ {formatCOP(shippingCustomer)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-black text-primary-700 text-lg">{formatCOP(total)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming || cart.length === 0}
              className="mt-4 w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Procesando...
                </span>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirmar Venta
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              Se generarán recibo y etiqueta de envío en PDF
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
