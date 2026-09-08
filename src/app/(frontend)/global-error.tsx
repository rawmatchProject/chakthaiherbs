"use client"

/**
 * The last resort: an error thrown by the root layout itself, where the site's
 * header, footer and stylesheet are all unavailable. Next renders this document
 * in place of the root layout and does not load global CSS with it, so every
 * style here is inline and the palette is repeated by hand.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="th">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#eee8d9",
          color: "#17200f",
          fontFamily: "'Sarabun', Tahoma, sans-serif",
          lineHeight: 1.9,
        }}
      >
        <title>เว็บไซต์ขัดข้อง · สมุนไพรชากไทย</title>
        <main style={{ maxWidth: "34rem" }}>
          <p
            style={{
              display: "inline-block",
              margin: 0,
              padding: "0.35rem 0.75rem",
              background: "#2c6137",
              color: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 600,
              borderRadius: "2px",
            }}
          >
            ขัดข้อง
          </p>
          <h1 style={{ fontSize: "1.75rem", lineHeight: 1.34, margin: "1.5rem 0 0" }}>
            เว็บไซต์ขัดข้องชั่วคราว
          </h1>
          <p style={{ margin: "1rem 0 0", fontSize: "1.125rem" }}>
            ขออภัยในความไม่สะดวก โปรดลองอีกครั้งในอีกสักครู่
          </p>
          <p style={{ margin: "2rem 0 0" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                font: "inherit",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.85rem 1.75rem",
                border: 0,
                borderRadius: "2px",
                background: "#2c6137",
                color: "#fff",
              }}
            >
              ลองใหม่อีกครั้ง
            </button>
          </p>
          {error.digest && (
            <p style={{ margin: "2rem 0 0", fontSize: "0.9375rem", color: "#5f5a4c" }}>
              รหัสอ้างอิง: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
