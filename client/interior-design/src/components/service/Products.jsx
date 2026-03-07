// Products.jsx
import React, { useState } from "react";
import { 
  Hammer, Leaf, Palette, Home as HomeIcon, Bed, Wrench, Clock, Shield, Truck, ArrowRight 
} from "lucide-react";
import Home from "../home/Home"; // adjust path if needed

const Products = () => {
  const [showHome, setShowHome] = useState(false);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", margin: 0, padding: 0, background: "#fff" }}>
      {/* Navigation */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #eee",
        zIndex: 1000,
        padding: "1.5rem 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>Whitewise</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
          <div style={{ display: "flex", gap: "2rem", fontSize: "0.95rem" }}>
            <a href="#" style={{ color: "#555", textDecoration: "none" }}>About us</a>
            <a href="#" style={{ color: "#555", textDecoration: "none" }}>Our work</a>
            <a href="#" style={{ color: "#555", textDecoration: "none" }}>Contact</a>
            <a href="#" style={{ color: "#555", textDecoration: "none" }}>More</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a href="#" style={{ fontSize: "0.9rem", color: "#666" }}>Sign in</a>
            <button style={{
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "0.75rem 1.8rem",
              borderRadius: "50px",
              fontWeight: "500",
              cursor: "pointer"
            }}>
              Start
            </button>
          </div>
        </div>
      </nav>

      {/* Conditional rendering: Show Products page or Home */}
      {showHome ? (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setShowHome(false)}
            style={{
              position: "fixed",
              top: "20px",
              left: "20px",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "#000",
              color: "#fff",
              zIndex: 1001,
            }}
          >
            ← Back
          </button>

          {/* Render Home component */}
          <Home />
        </div>
      ) : (
        <div>
          {/* Hero */}
          <section style={{ paddingTop: "140px", paddingBottom: "100px", textAlign: "center" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem" }}>
              <h2 style={{ fontSize: "4.8rem", fontWeight: "500", lineHeight: "1.1", marginBottom: "1.5rem" }}>
                Furniture built to last<br />and endure
              </h2>
              <p style={{ fontSize: "1.3rem", color: "#666", lineHeight: "1.6" }}>
                We craft pieces that stand the test of time. Each item is made with care and honest materials, designed for the life you actually live.
              </p>
              <div style={{ marginTop: "3rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button 
                  onClick={() => setShowHome(true)}
                  style={{
                    background: "#000",
                    color: "#fff",
                    padding: "1rem 2.5rem",
                    borderRadius: "50px",
                    border: "none",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  Explore <ArrowRight size={20} />
                </button>
                <button style={{
                  padding: "1rem 2.5rem",
                  border: "1px solid #ccc",
                  background: "transparent",
                  borderRadius: "50px",
                  fontSize: "1.1rem"
                }}>
                  Learn
                </button>
              </div>
            </div>

            <img 
              src="https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1600&h=900&fit=crop"
              alt="Modern living room with Tege furniture"
              style={{ width: "100%", maxWidth: "1400px", margin: "4rem auto 0", borderRadius: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
            />
          </section>

          {/* What Sets Us Apart */}
          <section style={{ background: "#f8f8f8", padding: "120px 5%", textAlign: "center" }}>
            <h3 style={{ fontSize: "3rem", fontWeight: "500" }}>What sets us apart</h3>
            <p style={{ maxWidth: "700px", margin: "1.5rem auto", color: "#666", fontSize: "1.2rem" }}>
              We believe in making furniture the right way. No shortcuts, no compromises. Just solid construction and materials that matter.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "4rem", maxWidth: "1200px", margin: "5rem auto 0" }}>
              {[
                { Icon: Hammer, title: "Honest craftsmanship", desc: "Every piece is built by hand with attention to detail that shows." },
                { Icon: Leaf, title: "Sustainable materials", desc: "We source responsibly and build pieces meant to last generations." },
                { Icon: Palette, title: "Modern design", desc: "Clean lines and timeless forms that work in any home." }
              ].map((item, i) => (
                <div key={i}>
                  <item.Icon size={56} style={{ margin: "0 auto" }} />
                  <h4 style={{ fontSize: "1.6rem", margin: "1.5rem 0 1rem" }}>{item.title}</h4>
                  <p style={{ color: "#666", lineHeight: "1.6" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Collections */}
          <section style={{ padding: "120px 5%", textAlign: "center" }}>
            <h3 style={{ fontSize: "3rem", fontWeight: "500" }}>Furniture for every room</h3>
            <p style={{ maxWidth: "700px", margin: "1.5rem auto", color: "#666", fontSize: "1.2rem" }}>
              From living spaces to bedrooms, we have pieces that fit the way you live.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "4rem", maxWidth: "1200px", margin: "5rem auto 0" }}>
              {[
                { Icon: HomeIcon, title: "Living room", desc: "Sofas, chairs, and tables that anchor your space." },
                { Icon: Bed, title: "Bedroom", desc: "Beds and storage that combine comfort with clean design." },
                { Icon: Wrench, title: "Custom pieces", desc: "We build what you need when standard options don’t fit." }
              ].map((item, i) => (
                <div key={i}>
                  <item.Icon size={56} style={{ margin: "0 auto" }} />
                  <h4 style={{ fontSize: "1.6rem", margin: "1.5rem 0 1rem" }}>{item.title}</h4>
                  <p style={{ color: "#666", lineHeight: "1.6" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section style={{ background: "#f8f8f8", padding: "120px 5%", textAlign: "center" }}>
            <h3 style={{ fontSize: "3rem", fontWeight: "500" }}>What customers say</h3>
            <p style={{ color: "#666", marginBottom: "4rem" }}>Real experiences from people who live with our furniture</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
              {[
                { text: "The sofa has held up beautifully. Built like they don’t make them anymore.", name: "Sarah Mitchell", role: "Homeowner, Portland" },
                { text: "We ordered a custom dining table and the quality exceeded what we expected.", name: "James Chen", role: "Designer, Seattle" },
                { text: "Five years in and everything still feels solid. Worth every penny.", name: "Emma Rodriguez", role: "Architect, Austin" }
              ].map((t, i) => (
                <div key={i} style={{ background: "#fff", padding: "2.5rem", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                  <p style={{ fontStyle: "italic", fontSize: "1.15rem", lineHeight: "1.7" }}>“{t.text}”</p>
                  <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "50px", height: "50px", background: "#ddd", borderRadius: "50%" }}></div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontWeight: "600" }}>{t.name}</p>
                      <p style={{ fontSize: "0.9rem", color: "#888" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section style={{ padding: "120px 5%", textAlign: "center" }}>
            <h3 style={{ fontSize: "3rem", fontWeight: "500" }}>Questions</h3>
            <p style={{ color: "#666", marginBottom: "4rem" }}>Find answers about our furniture, how we work, and what to expect.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "3rem", maxWidth: "1000px", margin: "0 auto" }}>
              {[
                { Icon: Clock, title: "How long does delivery take?", desc: "Most orders ship within two weeks of purchase." },
                { Icon: Shield, title: "Is there a warranty included?", desc: "All pieces come with a five-year structural warranty." },
                { Icon: Leaf, title: "What materials do you use?", desc: "We source solid wood, natural fabrics, and sustainable materials throughout." },
                { Icon: Truck, title: "Do you ship internationally?", desc: "We currently deliver throughout the continental United States." }
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "left" }}>
                  <item.Icon size={36} />
                  <h4 style={{ margin: "1rem 0", fontSize: "1.3rem" }}>{item.title}</h4>
                  <p style={{ color: "#666" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section style={{ background: "#000", color: "#fff", padding: "150px 5%", textAlign: "center" }}>
            <h3 style={{ fontSize: "4.5rem", fontWeight: "500" }}>Start building your space</h3>
            <p style={{ fontSize: "1.4rem", color: "#ccc", margin: "2rem 0 3rem" }}>
              See what whitewise Furniture can do for your home.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "5rem" }}>
              <button style={{ background: "#fff", color: "#000", padding: "1.2rem 3rem", borderRadius: "50px", fontSize: "1.2rem", border: "none" }}>
                Shop
              </button>
              <button style={{ border: "1px solid #fff", background: "transparent", color: "#fff", padding: "1.2rem 3rem", borderRadius: "50px", fontSize: "1.2rem" }}>
                Inquire
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&h=700&fit=crop"
              alt="Modern interior"
              style={{ width: "100%", maxWidth: "1200px", borderRadius: "20px", margin: "0 auto" }}
            />
          </section>

          {/* Footer */}
          <footer style={{ background: "#000", color: "#fff", padding: "4rem 5%", textAlign: "center" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
              <div>
                <h2 style={{ fontSize: "2rem", margin: 0 }}>whitewiseFurniture</h2>
                <p style={{ color: "#999", fontSize: "0.9rem", marginTop: "1rem" }}>© 2025 whitewiseFurniture. All rights reserved.</p>
              </div>
              <div style={{ display: "flex", gap: "2rem", fontSize: "0.95rem" }}>
                <a href="#" style={{ color: "#ccc", textDecoration: "none" }}>About us</a>
                <a href="#" style={{ color: "#ccc", textDecoration: "none" }}>Our work</a>
                <a href="#" style={{ color: "#ccc", textDecoration: "none" }}>Contact</a>
                <a href="#" style={{ color: "#ccc", textDecoration: "none" }}>Gallery</a>
                <a href="#" style={{ color: "#ccc", textDecoration: "none" }}>Showroom</a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Products;
