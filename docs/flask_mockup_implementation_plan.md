# TamrielForge Flask Mockup Implementation Plan

## Objective

Build a first visual version of **TamrielForge** as a Flask web app that communicates the product concept, navigation, and user journey described in `Project_description.md`, without implementing AI models, APIs, RAG, image generation, or text-to-speech.

This version should behave like a polished mockup:

- It must show the future workflow clearly.
- It must include separate tabs or pages for the main functionalities.
- It must establish an Elder Scrolls-inspired visual identity.
- It must leave explicit placeholders for future lore artwork and generated assets.

## Product Structure Derived from the Project Description

The project brief defines a four-step pipeline:

1. Conversational character building
2. Written backstory generation
3. Character portrait generation
4. Optional voice narration

For the mockup, those stages should be translated into a navigable Flask interface with one additional reference area:

- `Overview`: landing page that explains the value proposition
- `Character Forge`: mock conversational intake screen
- `Backstory`: literary result preview
- `Portrait`: generated art gallery preview
- `Voice`: optional narration preview
- `Lore Atlas`: future lore grounding and reference space

## Implementation Stages

### Stage 1. Project Skeleton

Goal: create the Flask structure and make the app runnable locally.

Deliverables:

- `app.py` with routes for each tab
- `templates/` folder with shared base template and individual pages
- `static/css/` for styling
- `static/images/elder_scrolls/` for artwork assets
- `docs/` folder for planning and supporting documentation

Acceptance criteria:

- Flask starts without errors
- Every route renders successfully
- Navigation between tabs works

### Stage 2. Visual Demo Layout

Goal: make the app feel like a real product even though it is still static.

Deliverables:

- Landing page with product framing
- Tabbed or route-based navigation
- Card-based sections showing each product capability
- Responsive styling for desktop and mobile

Design direction:

- Use a fantasy-inspired interface rather than a generic dashboard
- Reference Elder Scrolls atmosphere through parchment, bronze, ash, ruin, candlelight, and map-like textures
- Keep the UI readable and modern even while it feels thematic

Acceptance criteria:

- The interface communicates the pipeline in seconds
- The mockup feels cohesive and intentional
- The app is presentable as a course demo

### Stage 3. Placeholder Content and Image System

Goal: prepare the mockup for future artwork without adding final assets yet.

Deliverables:

- Placeholder image tags in templates
- Descriptive comments above each image placeholder
- Dedicated image folder with expected asset locations

Each placeholder comment should specify:

- What the image is for
- Where it appears in the UI
- Suggested dimensions
- Desired mood, composition, and visual style

Suggested placeholder asset set:

- `hero-banner-placeholder.jpg`
- `province-collage-placeholder.jpg`
- `character-anchor-placeholder.jpg`
- `manuscript-scene-placeholder.jpg`
- `portrait-primary-placeholder.jpg`
- `portrait-variant-placeholder.jpg`
- `narration-ambience-placeholder.jpg`
- `tamriel-map-placeholder.jpg`

Acceptance criteria:

- Another teammate can add the real images without guessing
- The code already references the intended filenames
- The folder structure matches the references

### Stage 4. Mock Interactions

Goal: imply future functionality without implementing real backend intelligence.

Deliverables:

- Static mock chat bubbles in Character Forge
- Static sample prose in Backstory
- Mock gallery cards in Portrait
- Non-functional playback UI in Voice
- Static lore categories in Lore Atlas

Acceptance criteria:

- A reviewer understands what each future module will do
- No one mistakes the app for a finished production system

### Stage 5. Content and Copy Pass

Goal: refine the language so the mockup matches the project vision.

Deliverables:

- Consistent wording across tabs
- Short explanatory text clarifying that the version is only a demo
- Lore-aware labels that fit the Elder Scrolls theme

Acceptance criteria:

- The mockup is easy to present in class
- The terminology connects directly to the assignment description

### Stage 6. Future Integration Preparation

Goal: leave the codebase ready for the real implementation phase.

Deliverables:

- Clear separation between presentation and future backend logic
- Predictable route names and template files
- Reusable layout components

Future work after the mockup:

1. Add form handling for character input
2. Connect the conversational module to an LLM
3. Add lore-grounding retrieval logic
4. Generate the backstory from structured character data
5. Generate portraits from character descriptors
6. Add optional TTS narration
7. Save creations and export results

## Image Placement Notes

The mockup should use Elder Scrolls lore imagery in a supportive way, not as decoration alone.

- Landing page images should establish epic scope and world identity.
- Character Forge art should emphasize a playable hero concept.
- Backstory imagery should support a literary, archival tone.
- Portrait tab imagery should behave like premium deliverables.
- Voice tab imagery should evoke storytelling and oral narration.
- Lore Atlas imagery should suggest canon, maps, geography, and world knowledge.

## Recommended Next Step After This Mockup

Once the visual mockup is approved, the next implementation cycle should focus on turning the `Character Forge` screen into the first interactive feature, because it is the entry point that feeds the rest of the pipeline.
