export interface Project {
    projectId: number
    complete: boolean
    projectName: string
    costType: 'workforce' | 'quality' | 'satisfaction'
    costCount: number
}