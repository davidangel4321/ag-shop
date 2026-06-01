import React, { useState, useRef, useMemo } from 'react'
import { Plus, Search, X, Upload, Layers, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['Ropa', 'Calzado', 'Accesorios', 'Electrónica', 'Hogar', 'Belleza', 'Deportes', 'Otro']

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  category: 'Ropa',
  costPrice: '',
  salePrice: '',
  stock: '',
  photo: null,
  variants: [],
}

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [hasVariants, setHasVariants] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileRef = useRef()

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [products, search, categoryFilter])

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  function openAdd() {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setHasVariants(false)
    setPhotoPreview(null)
    setShowModal(true)
  }

  function openEdit(product) {
    setEditingProduct(product)
    const hasVars = product.variants && product.variants.length > 0
    setHasVariants(hasVars)
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category: product.category,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      stock: product.stock,
      photo: product.photo,
      variants: hasVars ? product.variants : [],
    })
    setPhotoPreview(product.photo)
    setShowModal(true)
  }

  function addVariant() {
    setForm(f => ({ ...f, variants: [...f.variants, { size: '', stock: 0 }] }))
  }

  function updateVariant(idx, key, value) {
    setForm(f => ({ ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, [key]: value } : v) }))
  }

  function removeVariant(idx) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }))
  }

  function handleDelete(id) {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      deleteProduct(id)
      toast.success('Producto eliminado')
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const MAX = 400
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.7)
        setPhotoPreview(compressed)
        setForm(f => ({ ...f, photo: compressed }))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const variants = hasVariants
      ? form.variants.filter(v => v.size.trim()).map(v => ({ size: v.size.trim(), stock: Number(v.stock) }))
      : []
    const totalStock = hasVariants
      ? variants.reduce((s, v) => s + v.stock, 0)
      : Number(form.stock)
    const data = {
      ...form,
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      stock: totalStock,
      variants,
    }
    if (!data.sku || !data.name) {
      toast.error('SKU y nombre son obligatorios')
      return
    }
    if (hasVariants && variants.length === 0) {
      toast.error('Agrega al menos una talla')
      return
    }
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...data })
        toast.success('Producto actualizado')
      } else {
        if (products.some(p => p.sku === data.sku)) {
          toast.error('Ya existe un producto con ese SKU')
          return
        }
        await addProduct(data)
        toast.success('Producto agregado')
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar. Verifica la conexión.')
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos registrados</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {outOfStockCount} producto{outOfStockCount > 1 ? 's' : ''} agotado{outOfStockCount > 1 ? 's' : ''}
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          className="input sm:w-48"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg font-semibold">No se encontraron productos</p>
          <p className="text-gray-400 text-sm mt-1">
            {products.length === 0 ? 'Agrega tu primer producto' : 'Prueba con otros filtros'}
          </p>
          {products.length === 0 && (
            <button onClick={openAdd} className="btn-primary mx-auto mt-4">
              <Plus size={16} />
              Agregar producto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Photo upload */}
              <div>
                <label className="label">Foto del producto</label>
                <div
                  className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden relative"
                  onClick={() => fileRef.current?.click()}
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-semibold">Cambiar foto</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Haz clic para subir foto</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">SKU *</label>
                  <input className="input" placeholder="CAM-BLK-L" {...field('sku')} required />
                </div>
                <div>
                  <label className="label">Categoría</label>
                  <select className="input" {...field('category')}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Nombre *</label>
                <input className="input" placeholder="Camiseta Básica Negra" {...field('name')} required />
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea className="input resize-none" rows={2} placeholder="Descripción del producto..." {...field('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Costo ($)</label>
                  <input className="input" type="number" min="0" placeholder="15000" {...field('costPrice')} required />
                </div>
                <div>
                  <label className="label">Precio venta ($)</label>
                  <input className="input" type="number" min="0" placeholder="35000" {...field('salePrice')} required />
                </div>
              </div>

              {/* Variants toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-primary-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Tiene tallas / variantes</p>
                    <p className="text-xs text-gray-400">Ej: Talla 36, 37, 38...</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasVariants(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasVariants ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasVariants ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {!hasVariants ? (
                <div>
                  <label className="label">Stock</label>
                  <input className="input" type="number" min="0" placeholder="10" {...field('stock')} required />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Tallas y stock</label>
                    <button type="button" onClick={addVariant} className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
                      <Plus size={13} /> Agregar talla
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.variants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          className="input flex-1"
                          placeholder="Ej: Talla 36"
                          value={v.size}
                          onChange={e => updateVariant(idx, 'size', e.target.value)}
                        />
                        <input
                          className="input w-24"
                          type="number"
                          min="0"
                          placeholder="Uds."
                          value={v.stock}
                          onChange={e => updateVariant(idx, 'stock', e.target.value)}
                        />
                        <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-gray-400 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {form.variants.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">Haz clic en "Agregar talla" para comenzar</p>
                    )}
                  </div>
                  {form.variants.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Stock total: <strong>{form.variants.reduce((s, v) => s + Number(v.stock || 0), 0)} unidades</strong>
                    </p>
                  )}
                </div>
              )}

              {form.salePrice && form.costPrice && (
                <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
                  Margen: <strong>{(((form.salePrice - form.costPrice) / form.salePrice) * 100).toFixed(1)}%</strong>
                  {' '}• Ganancia: <strong>$ {(form.salePrice - form.costPrice).toLocaleString('es-CO')}</strong>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingProduct ? 'Guardar cambios' : 'Agregar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
