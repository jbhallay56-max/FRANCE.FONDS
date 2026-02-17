(function(){
  const nav = `
    <div class="nav">
      <a class="brand" href="/index.html">FRANCE</a>
      <div class="links">
        <a href="/problematique.html">Constat</a>
        <a href="/entreprise.html">Le Fonds</a>
        <a href="/marche.html">Marché & chiffres</a>
        <a href="/investisseurs.html">Investisseurs</a>
        <a class="btn" href="/login.html">Espace client</a>
      </div>
    </div>
  `;
  const foot = `
    <div class="footer">
      <div class="footer-grid">
        <div>
          <div class="footer-title">FRANCE</div>
          <div class="muted">Fonds stratégique souverain — réindustrialisation par l’épargne.</div>
          <div style="margin-top:10px">
            <span class="badge">Force industrielle</span>
            <span class="badge">Autonomie</span>
            <span class="badge">Circuits courts</span>
          </div>
        </div>
        <div>
          <div class="footer-title">Légal</div>
          <a class="muted" href="/mentions.html">Mentions légales</a><br/>
          <a class="muted" href="/confidentialite.html">Confidentialité</a>
        </div>
        <div>
          <div class="footer-title">Contact</div>
          <div class="muted">Présentation privée sur demande.</div>
        </div>
      </div>
      <div class="muted small">© ${new Date().getFullYear()} FRANCE — Tous droits réservés.</div>
    </div>
  `;
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("[data-nav]");
    const footer = document.querySelector("[data-footer]");
    if(header) header.innerHTML = nav;
    if(footer) footer.innerHTML = foot;
  });
})();