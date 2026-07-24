<script setup lang="ts">
import { ArrowRight, BarChart3, Dumbbell, ShieldCheck, WifiOff } from 'lucide-vue-next'

const features = [
  { icon: Dumbbell, title: 'Registra velocemente', description: 'Serie, carichi, ripetizioni e attività cardio in pochi tocchi.' },
  { icon: BarChart3, title: 'Segui i progressi', description: 'Consulta storico e riepiloghi per mantenere continuità negli allenamenti.' },
  { icon: WifiOff, title: 'Sempre disponibile', description: 'Funziona offline dopo il primo accesso, anche in una palestra senza rete.' }
]
</script>

<template>
  <div class="landing">
    <header class="landing-header">
      <RouterLink to="/" class="brand" aria-label="Gym Tracker, pagina iniziale">
        <span class="brand__mark"><Dumbbell :size="24" aria-hidden="true" /></span>
        <span>Gym Tracker</span>
      </RouterLink>
      <RouterLink to="/dashboard/oggi" class="header-link">Apri l’app</RouterLink>
    </header>

    <main>
      <section class="hero">
        <div class="hero__content">
          <p class="hero__eyebrow">Il tuo diario di allenamento</p>
          <h1>Ogni serie conta.<br><span>Registrala.</span></h1>
          <p class="hero__copy">Un modo semplice e veloce per tenere traccia degli allenamenti, vedere i progressi e restare concentrato sui tuoi obiettivi.</p>
          <div class="hero__actions">
            <RouterLink to="/dashboard/oggi" class="primary-link">Vai alla dashboard <ArrowRight :size="20" aria-hidden="true" /></RouterLink>
            <span class="privacy-note"><ShieldCheck :size="18" aria-hidden="true" /> Dati salvati solo sul tuo dispositivo</span>
          </div>
        </div>

        <div class="hero-card" aria-label="Anteprima di una registrazione">
          <div class="hero-card__top"><span>Allenamento di oggi</span><span class="status">In corso</span></div>
          <div class="exercise-preview">
            <div class="exercise-preview__title"><span class="exercise-icon"><Dumbbell :size="20" aria-hidden="true" /></span><div><strong>Panca piana</strong><small>3 serie</small></div></div>
            <div class="set-preview"><span>1</span><strong>60 kg</strong><span>× 10 rep</span></div>
            <div class="set-preview"><span>2</span><strong>60 kg</strong><span>× 10 rep</span></div>
            <div class="set-preview"><span>3</span><strong>60 kg</strong><span>× 8 rep</span></div>
          </div>
        </div>
      </section>

      <section class="features" aria-labelledby="features-title">
        <div class="section-heading"><p>Essenziale, come deve essere</p><h2 id="features-title">Tutto quello che serve durante l’allenamento.</h2></div>
        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.title" class="feature-card">
            <span class="feature-card__icon"><component :is="feature.icon" :size="24" aria-hidden="true" /></span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </section>
    </main>

    <footer><span>Gym Tracker</span><span>Allenamenti e dati restano nel browser.</span></footer>
  </div>
</template>

<style scoped>
.landing{min-height:100vh;background:var(--color-bg)}
.landing-header{width:min(100% - 32px,1120px);min-height:76px;display:flex;align-items:center;justify-content:space-between;margin:0 auto}
.brand{display:flex;align-items:center;gap:var(--space-3);font-weight:800;text-decoration:none}.brand__mark{width:42px;height:42px;display:grid;place-items:center;color:var(--color-on-primary);border-radius:12px;background:var(--color-primary)}
.header-link{min-height:44px;display:inline-flex;align-items:center;padding:0 var(--space-4);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--text-sm);font-weight:750;text-decoration:none;background:var(--color-surface)}
.hero{width:min(100% - 32px,1120px);display:grid;gap:var(--space-8);align-items:center;margin:0 auto;padding:72px 0 96px}.hero__content{max-width:650px}.hero__eyebrow{margin:0 0 var(--space-4);color:var(--color-accent-text);font-size:var(--text-sm);font-weight:800;letter-spacing:.08em;text-transform:uppercase}.hero h1{margin:0;font-size:clamp(2.8rem,9vw,5.6rem);line-height:.98;letter-spacing:-.055em}.hero h1 span{color:var(--color-accent-text)}.hero__copy{max-width:580px;margin:var(--space-6) 0 0;color:var(--color-text-muted);font-size:clamp(1.05rem,2vw,1.25rem);line-height:1.65}.hero__actions{display:flex;align-items:center;flex-wrap:wrap;gap:var(--space-4);margin-top:var(--space-8)}.primary-link{min-height:52px;display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);padding:0 var(--space-5);color:var(--color-on-primary);border-radius:var(--radius-md);background:var(--color-primary);font-weight:800;text-decoration:none}.primary-link:hover{background:var(--color-primary-strong)}.privacy-note{display:inline-flex;align-items:center;gap:var(--space-2);color:var(--color-text-muted);font-size:var(--text-sm)}
.hero-card{padding:var(--space-4);border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-surface);box-shadow:0 24px 60px rgb(23 19 10/.12);transform:rotate(1deg)}.hero-card__top{display:flex;align-items:center;justify-content:space-between;padding:var(--space-2) 0 var(--space-4);color:var(--color-text-muted);font-size:var(--text-sm);font-weight:700}.status{padding:4px 9px;color:var(--color-accent-text);border-radius:99px;background:var(--color-primary-soft);font-size:var(--text-xs)}.exercise-preview{display:grid;gap:var(--space-2);padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface-subtle)}.exercise-preview__title{display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)}.exercise-preview__title div{display:grid;gap:2px}.exercise-preview__title small{color:var(--color-text-muted)}.exercise-icon{width:42px;height:42px;display:grid;place-items:center;color:var(--color-on-primary);border-radius:12px;background:var(--color-primary)}.set-preview{min-height:46px;display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:var(--space-3);padding:0 var(--space-3);border-radius:var(--radius-sm);background:var(--color-surface)}.set-preview>span{color:var(--color-text-muted)}
.features{padding:80px max(16px,calc((100% - 1120px)/2));background:var(--color-surface)}.section-heading{max-width:680px}.section-heading>p{margin:0 0 var(--space-3);color:var(--color-accent-text);font-size:var(--text-sm);font-weight:800;text-transform:uppercase;letter-spacing:.08em}.section-heading h2{margin:0;font-size:clamp(2rem,5vw,3.2rem);line-height:1.1;letter-spacing:-.035em}.feature-grid{display:grid;gap:var(--space-4);margin-top:var(--space-8)}.feature-card{padding:var(--space-5);border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg)}.feature-card__icon{width:48px;height:48px;display:grid;place-items:center;color:var(--color-accent-text);border-radius:12px;background:var(--color-primary-soft)}.feature-card h3{margin:var(--space-5) 0 var(--space-2);font-size:var(--text-lg)}.feature-card p{margin:0;color:var(--color-text-muted);line-height:1.6}
footer{width:min(100% - 32px,1120px);display:flex;justify-content:space-between;gap:var(--space-4);margin:0 auto;padding:var(--space-6) 0;color:var(--color-text-muted);font-size:var(--text-sm)}footer span:first-child{color:var(--color-text);font-weight:800}
@media(min-width:800px){.hero{grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);min-height:650px}.feature-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:520px){.hero{padding:48px 0 72px}.hero__actions,.primary-link{width:100%}.hero-card{transform:none}.features{padding-top:64px;padding-bottom:64px}footer{flex-direction:column}}
@media(prefers-reduced-motion:no-preference){.primary-link svg{transition:transform 140ms ease}.primary-link:hover svg{transform:translateX(3px)}}
</style>
