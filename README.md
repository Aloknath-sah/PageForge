# PageForge

A configuration-driven landing page builder built with
Next.js, TypeScript and Tailwind CSS.

## Product

PageForge allows users to:

- Choose a landing page template
- Customize page sections
- Preview the page
- Save drafts
- Publish pages
- Share public landing page URLs

## Architecture

```text
                    PageForge
                       |
        +--------------+--------------+
        |                             |
     Dashboard                    Public Pages
        |                             |
     Editor                       Renderer
        |                             |
        +-------------+-------------+
                      |
                 PageConfig
                      |
                  Database
