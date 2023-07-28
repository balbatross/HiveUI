import React, { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { Breadcrumbs } from './components/breadcrumbs'
import { ActionHeader } from './components/header'
import { FileExplorerContext } from './context'
import { DEFAULT_ICONS } from './defaults/defaultIcons'
import { FolderModal } from './modals'
import { IAction } from './types/action'
import { Breadcrumb, IFile } from './types/file'
import { humanFileSize } from './utils'
import { GridView } from './views/grid'
import { ListView } from './views/list'
import { ThumbnailView } from './views/thumbnail'

import { useDropzone } from 'react-dropzone'
import { MissingPreview } from './components/missing-preview'
import { UploadDrawer } from './components/upload-drawer'
import _ from 'lodash'
import { history as historyRef, listenHistory } from './context/history'
import { RenameModal } from './modals/rename-modal'
import { DeleteModal } from './modals/delete-modal'
import { Divider, Menu, MenuItem, Box, Button, Paper, IconButton, ToggleButtonGroup, ToggleButton, CircularProgress, Typography } from '@mui/material'

export interface FileExplorerProps {
    files?: IFile[] | IFile
    loading?: boolean;

    refetchFiles?: (path: string) => IFile[];

    preview?: string;

    uploading?: {name?: string, percent?: number}[]

    previewEngines?: {filetype: string, component: React.FC<{file: any}>}[];

    actions?: IAction[];
    
    onDrop?: (files: File[]) => void;
    onClick?: (item: IFile) => void;

    path: string;
    onNavigate?: (path: string) => void;
    
    selected?: string[];
    onSelectionChange?: (id: string[]) => void;

    onCreateFolder?: (folderName: string) => Promise<void>;
    onRename?: (file: IFile, newName: string) => Promise<void>;
    onDelete?: (file: IFile | IFile[]) => Promise<void>;
}

export const FileExplorer : React.FC<FileExplorerProps> = (props) => {
    
    const [anchorPos, setAnchorPos] = useState<{ top: number, left: number }>()
    
    const [navigationHistory, setNavigationHistory] = useState<{path: {name: string, id: string}[]}[]>([])
    const [ currentPath, setCurrentPath ] = useState<number>(-1)

    const [ breadcrumbs, setBreadcrumbs ] = useState<Breadcrumb[]>([])

    const [ view, setView ] = useState<string>('list');

    const [ createFolderOpen, openCreateFolder] = useState<boolean>(false)
    const [ renameModalOpen, openRenameModal ] = useState(false)
    const [ deleteModalOpen, openDeleteModal ] = useState(false);

    useEffect(() => {
        setBreadcrumbs(props.path.split('/').slice(1).map((x) => ({name: x})))
        props.refetchFiles?.(props.path);
    }, [props.path])


    const views : {[key: string]: JSX.Element} = {
        list: <ListView />,
        grid: <GridView />,
        thumbnail: <ThumbnailView />
    }

    const navigate = (path: string) => {
        let parts = props.path.split('/').slice(1).filter((a) => a.length > 0);
        parts.push(path);

        props.onNavigate?.(`/${parts.join('/')}`)
        // historyRef.push(`/explore/${id}`, {id: id})
    }

    const [ preview, setPreview ] = useState<IFile  | undefined | null>(null)

    const goPrev = () => {
        historyRef.back()
        // onNavigate()
        // let history = navigationHistory.slice()
        // let prev = history[currentPath - 2]
        // setCurrentPath(currentPath - 1)
        // props.onBreadcrumbClick(prev.path[prev.path.length - 1])
    }

    const goNext = () => {
        historyRef.forward()
        // onNavigate()
        // let history = navigationHistory.slice()
        // let next = history[currentPath]
        // setCurrentPath(currentPath + 1)
        // props.onBreadcrumbClick(next.path[next.path.length - 1])
    }

    const formatFile = (file: IFile) => {
        return {
            ...file,
            icon: DEFAULT_ICONS(file)
        }
    }

    const onDrop = (acceptedFiles: File[]) => {
        // Do something with the files
        props.onDrop?.(acceptedFiles)
    }
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, noClick: true})
   

    const [ selectedFile, setSelectedFile ] = useState<IFile | IFile[]>()

    useEffect(() => {
        window.addEventListener('keydown', (e) => {
            if(e.key == "Escape") {
                props.onSelectionChange?.([])
            }
        })
    }, [])

    return (
        <FileExplorerContext.Provider value={{
            navigate: navigate,
            onNavigate: props.onNavigate,
            breadcrumbs,
            setBreadcrumbs,
            files: Array.isArray(props.files) ? props.files?.map(formatFile) : (props.files) ? [formatFile(props.files)] : [],
            uploading: props.uploading || [],
            selected: props.selected,
            clickFile: props.onClick,
            selectFile: (id) => id && (
                (props.selected || []).indexOf(id) < 0) ? 
                    props.onSelectionChange?.([...new Set([...(props.selected || []), id])]) :
                    props.onSelectionChange?.((props.selected || []).filter((a) => a !== id)),
            view, 
            setView,
            actions: props.actions || [],
            triggerRenameFile: (file) => {
                setSelectedFile(file)
                openRenameModal(true);
            },
            triggerDeleteFile: (file) => {
                setSelectedFile(file)
                openDeleteModal(true)
            }
        }}>
            <FolderModal 
                onClose={() => {
                    openCreateFolder(false)
                    setSelectedFile(undefined)
                }} 
                onSubmit={async (folderName) => {
                    await props.onCreateFolder?.(folderName)
                    openCreateFolder(false);
                    setSelectedFile(undefined)
                }}
                open={createFolderOpen} />
  
            <DeleteModal 
                selected={selectedFile}
                onClose={() => {
                    openDeleteModal(false)
                    setSelectedFile(undefined)
                }} 
                onSubmit={async () => {
                    if(selectedFile) await props.onDelete?.(selectedFile)
                    openDeleteModal(false)
                    setSelectedFile(undefined)

                }} 
                open={deleteModalOpen} />
            <RenameModal  
                selected={!Array.isArray(selectedFile) ? selectedFile : undefined}
                onClose={() => {
                    openRenameModal(false)
                    setSelectedFile(undefined)
                }} 
                onSubmit={async (newName) => {
                    if(selectedFile && !Array.isArray(selectedFile)) await props.onRename?.(selectedFile, newName)
                    openRenameModal(false)
                    setSelectedFile(undefined)
                }}
                open={renameModalOpen} />

            <Menu
              anchorReference={'anchorPosition'}
              anchorPosition={anchorPos}
              open={Boolean(anchorPos)}
              onClose={() => setAnchorPos(undefined)}
            >
              <MenuItem onClick={() => {
                openCreateFolder(true)
                setAnchorPos(undefined)
              }}>New Folder</MenuItem>
   
            </Menu>
            
            <Paper 
                onContextMenu={(evt) => {
                    evt.preventDefault()
                    setAnchorPos({ top: evt.clientY, left: evt.clientX })
                }}
                sx={{bgcolor: 'primary.light', flex: 1, display: 'flex', position: 'relative', flexDirection: 'column'}}>
               
                <Box   
                    sx={{display: 'flex'}}>
                    <ActionHeader />
                    
                </Box>
                <Divider />
                <Box 
                    {...getRootProps()}
                    sx={{
                        border: isDragActive ? '1px solid #dfdfdf' : 'undefined',
                        position: 'relative',
                        overflow: 'auto',
                        // padding: '6px',
                        display: 'flex', 
                        flexDirection: 'column',
                        flex: 1
                    }}>
                    <input {...getInputProps()} />
                    {!Array.isArray(props.files) ? 
                        props.previewEngines?.find((a) => a.filetype == (Array.isArray(props.files) ? props.files?.find((b) => b.id == props.preview)?.name?.split('.')[1] : props.files?.name?.split('.')[1]) )?.component({file: Array.isArray(props.files) ? props.files?.[0] : props.files}) || <MissingPreview file={Array.isArray(props.files) ? props.files?.[0] : props.files} /> :
                        views[view]
                    }
                    {props.loading && <div style={{
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        left: 0, 
                        bottom: 0, 
                        background: "#dfdfdf42",
                        flexDirection: 'column',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CircularProgress />    
                        <Typography>Loading ...</Typography>
                    </div>}
                </Box>
                {(props.uploading || []).length > 0 && <UploadDrawer />}

            </Paper>
        </FileExplorerContext.Provider>
    )
}