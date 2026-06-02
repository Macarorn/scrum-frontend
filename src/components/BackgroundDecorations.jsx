export default function BackgroundDecorations() {
  return (
    <div className="deco-wrapper">
      {/* Pastel colored blocks */}
      <div className="login-deco login-deco--block-mint" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-lavender" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-peach" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-yellow" aria-hidden="true"></div>

      {/* Dotted patterns */}
      <div className="login-deco login-deco--dots-tl" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-br" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-mid-r" aria-hidden="true"></div>
      <div className="login-deco login-deco--grid" aria-hidden="true"></div>

      {/* Outlined geometric shapes */}
      <div className="login-deco login-deco--rect-bl" aria-hidden="true"></div>
      <div className="login-deco login-deco--rect-tr" aria-hidden="true"></div>
      <div className="login-deco login-deco--sq-l" aria-hidden="true"></div>
      <div className="login-deco login-deco--sq-r" aria-hidden="true"></div>

      {/* Circles */}
      <div className="login-deco login-deco--circle-1" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-2" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-3" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-4" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-5" aria-hidden="true"></div>

      {/* SVG elements */}
      <div className="login-deco login-deco--squiggle-r" aria-hidden="true">
        <svg viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2C8 12 32 24 20 36C8 48 32 60 20 72" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" opacity="0.12"/>
        </svg>
      </div>
      <div className="login-deco login-deco--squiggle-l" aria-hidden="true">
        <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2C32 10 8 22 20 32C32 42 8 54 20 58" stroke="#39A900" strokeWidth="1.5" strokeLinecap="round" opacity="0.12"/>
        </svg>
      </div>
      <div className="login-deco login-deco--arrow" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 32L32 8M32 8H14M32 8V26" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="login-deco login-deco--cross-1" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2V18M2 10H18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="login-deco login-deco--cross-2" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3V17M3 10H17" stroke="#39A900" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Horizontal lines */}
      <div className="login-deco login-deco--lines-l" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div className="login-deco login-deco--lines-r" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}
