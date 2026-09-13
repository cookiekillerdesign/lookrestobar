import { Heart } from '@phosphor-icons/react'
import { loc } from '../i18n/site'
import { activeBadge, BadgeIcon, DEFAULT_CAT_EMOJI, effectivePrice } from './menuHelpers.jsx'

/** One dish card — used both in the category grid and in the search
 *  results, so a guest searching for a dish sees exactly the same card
 *  (photo, badge, weight, heart) they'd find scrolling the menu, instead of
 *  a stripped-down list row. */
export default function DishCard({ it, cat, lang, t, qty, pulse, flashed, onToggleFav, onQty, id }) {
  const badge = activeBadge(it)
  const oos = badge === 'out_of_stock'
  const hasDiscount = badge === 'discount' && it.discount_percent > 0
  const discountedPrice = hasDiscount ? effectivePrice(it) : null
  return (
    <article className={`lm-card${oos ? ' oos' : ''}${flashed ? ' flash' : ''}`} id={id}>
      {badge && (
        <span className={`lm-badge lm-badge--${badge}`}>
          <i className="lm-badge-ic"><BadgeIcon type={badge} /></i>
          {badge === 'recommended' && t.recommended}
          {badge === 'new' && t.badgeNew}
          {badge === 'out_of_stock' && t.badgeOutOfStock}
          {badge === 'discount' && t.badgeDiscount(it.discount_percent)}
        </span>
      )}
      <div className="lm-thumb">
        {it.photo_url
          ? <img src={it.photo_url} alt={loc(it, lang, 'name')} loading="lazy" decoding="async" />
          : <div className="lm-thumb-fallback">{cat?.emoji || DEFAULT_CAT_EMOJI}</div>}
      </div>
      <div className="lm-card-body">
        <div className="lm-card-top">
          <div>
            <h3>{loc(it, lang, 'name')}</h3>
            {loc(it, lang, 'description') && <p className="lm-desc">{loc(it, lang, 'description')}</p>}
          </div>
          <button
            className={`lm-fav-btn${qty > 0 ? ' on' : ''}${pulse ? ' pulse' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFav() }}
            disabled={oos}
            aria-label={t.addToList}
          >
            <Heart size={20} weight={qty > 0 ? 'fill' : 'regular'} />
          </button>
        </div>
        <div className="lm-card-meta">
          {it.weight && <span className="lm-weight">{it.weight}</span>}
          {hasDiscount ? (
            <span className="lm-price-wrap">
              <span className="lm-price-old">{it.price}<i>lei</i></span>
              <span className="lm-price lm-price-discounted">{discountedPrice}<i>lei</i></span>
            </span>
          ) : (
            <span className="lm-price">{it.price}<i>lei</i></span>
          )}
        </div>
        {qty > 0 && (
          <div className="lm-qty-inline">
            <button onClick={(e) => { e.stopPropagation(); onQty(qty - 1) }} aria-label={t.less}>−</button>
            <span>{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); onQty(qty + 1) }} aria-label={t.more}>+</button>
            <span className="lm-in-list">{t.inList}</span>
          </div>
        )}
      </div>
    </article>
  )
}
