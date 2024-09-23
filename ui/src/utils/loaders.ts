import { ComputeGraph, ComputeGraphsList, IndexifyClient } from 'getindexify'
import { LoaderFunctionArgs, redirect } from 'react-router-dom'
import {
  getIndexifyServiceURL,
} from './helpers'
import axios from 'axios';

async function createClient(namespace: string | undefined) {
  if (!namespace) throw new Error('Namespace is required')
  return await IndexifyClient.createClient({
    serviceUrl: getIndexifyServiceURL(),
    namespace,
  })
}

export async function ContentsPageLoader({ params }: LoaderFunctionArgs) {
  if (!params.namespace) return redirect('/')
  const client = await createClient(params.namespace)
  return { client }
}

export async function ComputeGraphsPageLoader({
  params,
}: LoaderFunctionArgs) {
  if (!params.namespace) return redirect('/')
  const client = await createClient(params.namespace)
  
  try {
    const computeGraphs = await axios.get<ComputeGraphsList>('http://localhost:8900/namespaces/default/compute_graphs');
    return {
      client: client,
      computeGraphs: computeGraphs.data,
      namespace: client.namespace,
    }
  } catch (error) {
    console.error("Error fetching compute graphs:", error)
    return {
      client: client,
      computeGraphs: { compute_graphs: [] },
      namespace: client.namespace,
    }
  }
}

export async function IndividualComputeGraphPageLoader({
  params,
}: LoaderFunctionArgs) {
  const { namespace, computeGraph } = params
  const computeGraphName = computeGraph
  if (!namespace) return redirect('/')
  
  const client = await createClient(params.namespace)
  
  const computeGraphs = (await axios.get<ComputeGraphsList>('http://localhost:8900/namespaces/default/compute_graphs')).data;

  const localComputeGraph = computeGraphs.compute_graphs.find((graph: ComputeGraph) => graph.name === computeGraphName);
  if (!computeGraph) {
    throw new Error(`Extraction graph ${localComputeGraph} not found`);
  }

  return {
    computeGraph: localComputeGraph,
    client,
    namespace: params.namespace,
  }
}

// export async function ExtractionPolicyPageLoader({
//   params,
// }: LoaderFunctionArgs) {
//   const { namespace, policyName, extraction_graph } = params
//   if (!namespace || !policyName) return redirect('/')

//   const client = await createClient(namespace)
//   const [computeGraphs] = await Promise.all([
//     client.computeGraphs()
//   ])

//   const computeGraph = computeGraphs.find(
//     (graph) => graph.name === extraction_graph
//   )
//   const policy = computeGraphs
//     .flatMap((graph) => graph.extraction_policies)
//     .find(
//       (policy) => policy.name === policyName && policy.graph_name === extraction_graph
//     )
//   return { policy, namespace, computeGraph, client }
// }

export async function NamespacesPageLoader() {
  const namespaces = await IndexifyClient.namespaces()
  return { namespaces }
}

// export async function IndexesPageLoader({ params }: LoaderFunctionArgs) {
//   if (!params.namespace) return redirect('/')
//   const client = await createClient(params.namespace)
//   const indexes = await client.indexes()
//   return {
//     indexes,
//     namespace: params.namespace,
//   }
// }

// export async function IndividualContentPageLoader({
//   params,
// }: LoaderFunctionArgs) {
//   const { namespace, extractorName, contentId } = params
//   if (!namespace || !contentId) return redirect('/')

//   const client = await createClient(namespace)
//   const [computeGraphs, contentMetadata] = await Promise.all([
//     client.computeGraphs(),
//     client.getContentMetadata(contentId)
//   ])

//   return {
//     client,
//     namespace,
//     contentId,
//     contentMetadata,
//     extractorName,
//     computeGraphs
//   }
// }
