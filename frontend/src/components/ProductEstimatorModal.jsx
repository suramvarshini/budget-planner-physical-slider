import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Info, ShoppingBag } from 'lucide-react';
import { api } from '../api/client';
import { formatCurrency, CATEGORIES } from '../utils/formatters';
import toast from 'react-hot-toast';
import '../styles/modal.css';

export default function ProductEstimatorModal({ onClose, onSelectProposedExpense }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.searchProducts(query, selectedCategory);
        if (active) setProducts(res.data);
      } catch (err) {
        if (active) toast.error('Failed to load pricing estimates: ' + err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    const t = setTimeout(fetchProducts, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, selectedCategory]);

  const handlePickProduct = (product) => {
    onSelectProposedExpense({
      category: product.category,
      amount: product.estimatedPrice,
      description: `${product.name} (${product.unit})`,
    });
    toast.success(`Loaded "${product.name}" as proposed expense!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <ShoppingBag size={20} className="modal-icon" />
            <div>
              <h2>Product Price Lookup (Expense Estimator)</h2>
              <span className="modal-sub">Browse standard expense price references to plan future spending</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="estimator-notice">
            <Info size={16} />
            <span>
              <strong>Note:</strong> Prices shown below are reference demo estimates. Adding a product fills your
              new expense draft as a <em>proposed expense</em>; it will <strong>not</strong> be recorded into your budget until you review and confirm.
            </span>
          </div>

          <div className="estimator-filters">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products or expense items..."
                className="estimator-search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="estimator-category-select"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="products-list-wrapper">
            {loading ? (
              <div className="loading-state">Searching price reference catalog...</div>
            ) : products.length === 0 ? (
              <div className="empty-state">No matching products found for "{query}"</div>
            ) : (
              <div className="products-grid">
                {products.map(p => (
                  <div key={p.id} className="product-estimate-card">
                    <div className="pec-header">
                      <span className="pec-category">{p.category}</span>
                      <span className="pec-badge">ESTIMATE</span>
                    </div>
                    <h4 className="pec-name">{p.name}</h4>
                    <div className="pec-unit">{p.unit}</div>
                    <div className="pec-footer">
                      <div className="pec-price">{formatCurrency(p.estimatedPrice)}</div>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handlePickProduct(p)}
                        title="Draft as proposed expense"
                      >
                        <Plus size={14} /> Propose Expense
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
