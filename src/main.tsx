import '@scalar/api-reference-react/style.css'
import './styles.css'

import { ApiReferenceReact } from '@scalar/api-reference-react'
import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

type BusinessLayer = 'azure' | 'mule' | 'node'
type EnvironmentId = 'dev' | 'staging' | 'production'

const environments: Array<{
  id: EnvironmentId
  label: string
  description: string
  urlByLayer: Record<BusinessLayer, string>
}> = [
  {
    id: 'dev',
    label: 'Development',
    description: 'Daily integration testing.',
    urlByLayer: {
      azure: 'https://dev-azure-api.acme.test',
      mule: 'https://dev-mule-api.acme.test',
      node: 'https://dev-node-api.acme.test',
    },
  },
  {
    id: 'staging',
    label: 'Staging',
    description: 'Pre-release validation.',
    urlByLayer: {
      azure: 'https://staging-azure-api.acme.test',
      mule: 'https://staging-mule-api.acme.test',
      node: 'https://staging-node-api.acme.test',
    },
  },
  {
    id: 'production',
    label: 'Production',
    description: 'Live production APIs.',
    urlByLayer: {
      azure: 'https://azure-api.acme.test',
      mule: 'https://mule-api.acme.test',
      node: 'https://node-api.acme.test',
    },
  },
]

const layers: Array<{
  id: BusinessLayer
  label: string
  description: string
  tags: string[]
}> = [
  {
    id: 'azure',
    label: 'Azure',
    description: 'Cloud gateway and platform integration APIs.',
    tags: ['account', 'document', 'identity'],
  },
  {
    id: 'mule',
    label: 'Mule',
    description: 'Integration layer APIs for orchestration and routing.',
    tags: ['customer', 'order', 'sync'],
  },
  {
    id: 'node',
    label: 'Node',
    description: 'Application service APIs owned by the Node layer.',
    tags: ['notification', 'task', 'user'],
  },
]

function App() {
  const [activeLayer, setActiveLayer] = useState<BusinessLayer>('azure')
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentId>('dev')

  const layer = useMemo(
    () => layers.find((item) => item.id === activeLayer) ?? layers[0],
    [activeLayer],
  )

  const environment = useMemo(
    () =>
      environments.find((item) => item.id === activeEnvironment) ??
      environments[0],
    [activeEnvironment],
  )

  const activeServerUrl = environment.urlByLayer[activeLayer]

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <p className="eyebrow">API Docs</p>
          <h1>AI Business APIs</h1>
        </div>

        <div className="topbar-controls">
          <label className="field compact">
            <span>Business layer</span>
            <select
              onChange={(event) =>
                setActiveLayer(event.target.value as BusinessLayer)
              }
              value={activeLayer}
            >
              {layers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field compact">
            <span>Test environment</span>
            <select
              onChange={(event) =>
                setActiveEnvironment(event.target.value as EnvironmentId)
              }
              value={activeEnvironment}
            >
              {environments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

        </div>
      </header>

      <section className="reference-panel" aria-label={`${layer.label} API reference`}>
        <ApiReferenceReact
          key={`${activeLayer}-${activeEnvironment}`}
          configuration={{
            url: `${import.meta.env.BASE_URL}openapi/${activeLayer}.json`,
            servers: [
              {
                url: activeServerUrl,
                description: environment.label,
              },
            ],
            layout: 'modern',
            hideDownloadButton: false,
            theme: 'default',
            agent: {
              disabled: true,
            },
            searchHotKey: 'k',
          }}
        />
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
