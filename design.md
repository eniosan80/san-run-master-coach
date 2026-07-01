# SAN RUN MASTER COACH — Design System

## Brand Identity
**Nome:** SAN RUN MASTER COACH  
**Taglines:** "Mente San, Corpo Run." | "Constância em movimento." | "Resultado vem do processo."

## Color Palette
```css
--color-bg:        #0B0B0F;   /* Preto fundo principal */
--color-surface:   #131318;   /* Cards/superfícies elevadas */
--color-surface2:  #1C1C24;   /* Input fields, superfícies secundárias */
--color-green:     #00FF88;   /* Verde energia — CTA, destaque */
--color-orange:    #E36B3B;   /* Laranja terracota — marca, badges */
--color-blue:      #3A5F6F;   /* Azul pedra — informações, secundário */
--color-gray:      #A0A0A0;   /* Cinza técnico — textos secundários */
--color-white:     #FFFFFF;   /* Textos principais */
--color-border:    #2A2A35;   /* Bordas sutis */
```

## Typography
- **Títulos / Display:** Waffle Soft (Google Fonts import fallback: sans-serif cursiva) — usado em headers e telas de impacto
- **Body / UI:** Inter — todos os textos de interface, inputs, descrições
- **Scale:**
  - Display: 2.5rem / 700
  - H1: 1.75rem / 700
  - H2: 1.25rem / 600
  - Body: 1rem / 400
  - Small: 0.875rem / 400
  - Caption: 0.75rem / 400

## Layout
- Mobile-first: max-width 430px centrado em desktop
- Container padding: 20px horizontal
- Fundo desktop: gradiente radial sutil `#0B0B0F` → `#131318`
- Screen wrapper com scroll vertical, sem scroll horizontal

## Components

### Button Primary
- Background: `#00FF88` | texto: `#0B0B0F` | peso: 700
- Padding: 16px 24px | border-radius: 12px
- Hover: brightness(0.9) + transform scale(0.98)
- Disabled: opacity 0.4

### Button Secondary
- Background: transparent | border: 1px `#2A2A35` | texto: `#FFFFFF`
- Same padding and radius

### Card
- Background: `#131318` | border: 1px `#2A2A35`
- border-radius: 16px | padding: 20px
- Box-shadow: 0 4px 24px rgba(0,0,0,0.4)

### Input / Select
- Background: `#1C1C24` | border: 1px `#2A2A35`
- border-radius: 10px | padding: 14px 16px
- Texto: `#FFFFFF` | Placeholder: `#A0A0A0`
- Focus: border-color `#00FF88`

### Badge Level
- Levels têm cor única: Iniciante=gray, Básico=blue, Intermediário=orange, Avançado=green, Elite=verde brilhante
- border-radius: 20px | padding: 4px 12px

### Progress / Scale (RPE/Check-in)
- Sliders e botões circulares com fundo surface2
- Selecionado: `#00FF88` fill

## Motion (Framer Motion)
- Transição entre telas: slide horizontal + fade, duration 0.35s
- Entrada de cards: stagger 0.1s, translateY 20px → 0, opacity 0 → 1
- Botão CTA: pulse suave ao aparecer

## Logos
- `/logo-shield.png` — Escudo SAN RUN com águia (tela boas-vindas, header)
- `/logo-eagle.png` — Águia dourada isolada (loading, backgrounds decorativos)
- `/logo-wordmark.png` — Wordmark RUNUBS (rodapé, branding secundário)

## UX Patterns
- Progress bar no topo durante onboarding (steps 1 a 5)
- Cada tela tem apenas 1 ação principal
- Feedback visual imediato em seleções
- Textos em português brasileiro, tom motivacional mas direto
- Nunca comparar atletas, sempre foco no próprio progresso
