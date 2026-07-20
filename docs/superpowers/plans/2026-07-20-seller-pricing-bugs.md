# Seller Panel Pricing & Service Visibility Fix — Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to implement plan task-by-task.

**Goal:** Fix 5 logical bugs in the seller panel: per-1000 pricing, calculator integration, service filtering, admin service visibility toggle, and sales display.

**Architecture:** 
- **Bug 1 (CRITICAL)**: `rate` column in `services` table stores price per 1000 units (schema comment confirms). All subtotal calculations in seller sale creation, bulk orders, and cart UI use `unit_price * quantity` but should use `(quantity / 1000) * unit_price`. Fix frontend cart, frontend bulk orders preview, backend sale controller, and backend bulk orders route.
- **Bug 2 (MEDIUM)**: Calculator has no service integration. Add service selector that auto-fills cost from `provider_rate` and shows cost-per-1000 context. Return `provider_rate` in seller services API for calculator use.
- **Bug 3 (MEDIUM)**: No seller-specific service filtering. Add `seller_visible` column to `services` table. Filter seller services API by it. Add toggle in AdminServices page.
- **Bug 4 (LOW)**: Seller sales list/display shows wrong subtotal calculations. Fix formatting to use per-1000.
- **Bug 5 (LOW)**: Admin services table lacking seller visibility column. Add toggle column.

**Tech Stack:** React, Node.js, Express, MySQL

---

### Database Migration

**Files:**
- Create: `backend/database/migration_seller_visible.sql`

- [ ] **Step 1: Create migration file**

```sql
-- migration_seller_visible.sql
ALTER TABLE `services`
  ADD COLUMN `seller_visible` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Mostrar en el catálogo del vendedor'
  AFTER `is_active`;
```

---

### Task 1: Fix subtotal calculation in frontend cart (SellerNewSale.jsx)

**Files:**
- Modify: `frontend/src/pages/seller/SellerNewSale.jsx`

- [ ] **Step 1: Fix `addToCart` subtotal calculation**

Change line 318 and 327:

```jsx
// Old (line 318):
? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
// New:
? { ...i, quantity: i.quantity + 1, subtotal: ((i.quantity + 1) / 1000) * i.unit_price }

// Old (line 327):
subtotal: parseFloat(svc.rate || 0),
// New:
subtotal: (1 / 1000) * parseFloat(svc.rate || 0),
```

- [ ] **Step 2: Fix `updateQty` subtotal calculation**

Change line 339:

```jsx
// Old:
? { ...i, quantity: qty, subtotal: qty * i.unit_price }
// New:
? { ...i, quantity: qty, subtotal: (qty / 1000) * i.unit_price }
```

- [ ] **Step 3: Fix `updatePrice` subtotal calculation**

Change line 349:

```jsx
// Old:
? { ...i, unit_price: p, subtotal: i.quantity * p }
// New:
? { ...i, unit_price: p, subtotal: (i.quantity / 1000) * p }
```

- [ ] **Step 4: Fix catalog display to show price per 1000**

Change line 401:

```jsx
// Old:
<p className="text-xs" style={{ color: 'var(--em3)' }}>{fmtMoney(svc.rate)}</p>
// New:
<p className="text-xs" style={{ color: 'var(--em3)' }}>{fmtMoney(svc.rate)} / 1000</p>
```

---

### Task 2: Fix subtotal calculation in frontend bulk orders (SellerBulkOrders.jsx)

**Files:**
- Modify: `frontend/src/pages/seller/SellerBulkOrders.jsx`

- [ ] **Step 1: Fix total calculation (line 183)**

```jsx
// Old:
const total = validRows.reduce((sum, r) => sum + (Number(r.service?.rate || 0) * parseInt(r.quantity || 0)), 0)
// New:
const total = validRows.reduce((sum, r) => sum + ((parseInt(r.quantity || 0) / 1000) * Number(r.service?.rate || 0)), 0)
```

- [ ] **Step 2: Fix subtotal calculation in render (line 246)**

```jsx
// Old:
const subtotal = row.service && row.quantity ? Number(row.service.rate) * parseInt(row.quantity || 0) : 0
// New:
const subtotal = row.service && row.quantity ? (parseInt(row.quantity || 0) / 1000) * Number(row.service.rate) : 0
```

- [ ] **Step 3: Show rate as per 1000 in ServicePicker**

Change line 160:

```jsx
// Old:
<span className="text-xs flex-shrink-0" style={{ color: 'var(--em3)' }}>${Number(s.rate).toFixed(4)}</span>
// New:
<span className="text-xs flex-shrink-0" style={{ color: 'var(--em3)' }}>${Number(s.rate).toFixed(4)} / 1000</span>
```

---

### Task 3: Fix subtotal calculation in backend (sellerSaleController.js)

**Files:**
- Modify: `backend/src/controllers/sellers/sellerSaleController.js`

- [ ] **Step 1: Fix createSale subtotal calculation (line 107)**

```js
// Old:
const subtotal = price * qty;
// New:
const subtotal = (qty / 1000) * price;
```

---

### Task 4: Fix subtotal calculation in backend bulk orders route (seller.js)

**Files:**
- Modify: `backend/src/routes/seller.js`

- [ ] **Step 1: Fix bulk orders subtotal (line 127)**

```js
// Old:
const subtotal   = unit_price * parseInt(quantity);
// New:
const subtotal   = (parseInt(quantity) / 1000) * unit_price;
```

---

### Task 5: Add seller_visible filter to seller services endpoint

**Files:**
- Modify: `backend/src/routes/seller.js`
- Execute: migration_seller_visible.sql

- [ ] **Step 1: Add seller_visible filter to seller services query (line 225)**

```js
// Old:
const conditions = ['s.is_active = 1'];
// New:
const conditions = ['s.is_active = 1', 's.seller_visible = 1'];
```

- [ ] **Step 2: Include seller_visible in service response**

Change line 237:

```js
// Old:
SELECT s.id, s.name, s.rate, s.min_order, s.max_order, s.type,
// New:
SELECT s.id, s.name, s.rate, s.rate AS price_per_1k, s.min_order, s.max_order, s.type,
```

---

### Task 6: Add seller_visible toggle to admin panel (AdminServices.jsx)

**Files:**
- Modify: `frontend/src/pages/admin/AdminServices.jsx`

- [ ] **Step 1: Add "Seller" column header after "Activo"**

Change line 224:

```jsx
// Old:
{['ID','Nombre','Categoría','Proveedor','Costo/1K','Precio/1K','Ganancia','Min','Max','Activo'].map(h => (
// New:
{['ID','Nombre','Categoría','Proveedor','Costo/1K','Precio/1K','Ganancia','Min','Max','Activo','Vendedor'].map(h => (
```

- [ ] **Step 2: Add seller toggle button before the existing active toggle cell**

After line 298 (`</button>`), add:

```jsx
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSellerVisible(s)}
                            className="transition-all"
                            style={{ color: s.seller_visible ? 'var(--em3)' : 'var(--txt3)' }}>
                            {s.seller_visible
                              ? <ToggleRight size={22}/>
                              : <ToggleLeft  size={22}/>}
                          </button>
                        </td>
```

- [ ] **Step 3: Add toggleSellerVisible function after toggleActive**

Add after the `toggleActive` function:

```jsx
  const toggleSellerVisible = async (service) => {
    try {
      await api.patch(`/admin/services/${service.id}`, { seller_visible: service.seller_visible ? 0 : 1 })
      toast.success(service.seller_visible ? 'Oculto para vendedores' : 'Visible para vendedores')
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al cambiar visibilidad')
    }
  }
```

---

### Task 7: Update backend to handle seller_visible in update and getAll

**Files:**
- Modify: `backend/src/models/serviceModel.js`
- Modify: `backend/src/routes/admin.js` or `adminController.js`

- [ ] **Step 1: Add seller_visible to allowed fields in serviceModel.update**

Change line 159:

```js
// Old:
const allowed = [
  'name', 'description', 'rate', 'min_order', 'max_order',
  'type', 'is_active', 'category_id', 'refill', 'cancel', 'sort_order',
];
// New:
const allowed = [
  'name', 'description', 'rate', 'min_order', 'max_order',
  'type', 'is_active', 'seller_visible', 'category_id', 'refill', 'cancel', 'sort_order',
];
```

- [ ] **Step 2: Add seller_visible to getAll SELECT**

Change line 116:

```js
// Old:
s.refill, s.cancel, s.is_active, s.sort_order,
// New:
s.refill, s.cancel, s.is_active, s.seller_visible, s.sort_order,
```

---

### Task 8: Fix calculator to integrate with services (SellerCalculator.jsx)

**Files:**
- Modify: `frontend/src/pages/seller/SellerCalculator.jsx`

- [ ] **Step 1: Add service state and search at top of component**

After line 57, add state for service search:

```jsx
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceResults, setServiceResults] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [searchingServices, setSearchingServices] = useState(false)
  const debouncedServiceSearch = useDebounce(searchQuery, 350)
```

- [ ] **Step 2: Add useEffect to search services**

```jsx
  useEffect(() => {
    if (!debouncedServiceSearch || debouncedServiceSearch.length < 2) {
      setServiceResults([])
      return
    }
    setSearchingServices(true)
    sellerService.getServices({ page: 1, perPage: 8, search: debouncedServiceSearch })
      .then(res => setServiceResults(res.data?.data || []))
      .catch(() => setServiceResults([]))
      .finally(() => setSearchingServices(false))
  }, [debouncedServiceSearch])
```

- [ ] **Step 3: Add service selector panel before the input fields**

After the `<h2>Entradas</h2>` section (before FieldShell for cost), add:

```jsx
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>
              Servicio (opcional)
            </label>
            {selectedService ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl mb-2"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium" style={{ color: 'var(--txt)' }}>{selectedService.name}</p>
                  <p className="text-xs" style={{ color: 'var(--txt3)' }}>
                    Costo: ${Number(selectedService.provider_rate || 0).toFixed(4)} / 1000
                  </p>
                </div>
                <button onClick={() => { setSelectedService(null); setCost('') }}
                  className="p-1 rounded-lg" style={{ color: 'var(--txt3)' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar servicio por nombre..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
                />
              </div>
            )}
            {searchQuery.length >= 2 && !selectedService && (
              <div className="rounded-xl border overflow-hidden max-h-48 overflow-y-auto mb-2"
                style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}>
                {searchingServices ? (
                  <div className="p-3 text-center text-xs flex items-center justify-center gap-2" style={{ color: 'var(--txt3)' }}>
                    <Loader2 size={11} className="animate-spin" /> Buscando...
                  </div>
                ) : serviceResults.length === 0 ? (
                  <div className="p-3 text-center text-xs" style={{ color: 'var(--txt3)' }}>Sin resultados</div>
                ) : (
                  serviceResults.map(s => (
                    <button key={s.id} onClick={() => {
                      setSelectedService(s)
                      setCost(String(s.provider_rate || ''))
                      setSearchQuery('')
                      setServiceResults([])
                    }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left transition-all"
                      style={{ borderBottom: '1px solid var(--border2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span className="text-sm truncate" style={{ color: 'var(--txt)' }}>{s.name}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--txt3)' }}>
                        ${Number(s.provider_rate || 0).toFixed(4)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
```

- [ ] **Step 4: Add "Loader2" to imports and "X" to imports**

The imports need `X` and `Loader2` - they're already imported in the component.

---

### Task 9: Run the migration

**Files:**
- Execute: `backend/database/migration_seller_visible.sql`

- [ ] **Step 1: Run the SQL migration**

Run via the project's SQL runner or manually:
```bash
node backend/database/runSql.js backend/database/migration_seller_visible.sql
```

---

### Task 10: Verify build

- [ ] **Step 1: Run frontend build**

```bash
cd frontend && npx vite build --logLevel error
```
Expected: No errors

- [ ] **Step 2: Check backend syntax**

```bash
cd backend && node -e "require('./src/routes/seller'); require('./src/controllers/sellers/sellerSaleController'); require('./src/models/serviceModel'); console.log('OK')"
```
Expected: OK

---

### Task 11: Commit

```bash
git add -A
git commit -m "fix: correct per-1000 pricing in seller panel, add seller_visible flag, integrate calculator with services"
git push
```
