export function getKeywordFromFilePath(filepath: string){
    const splitedFilePath = filepath.split('/')
    const filename = splitedFilePath[splitedFilePath.length - 1]
    const normalizedFilename = filename.split('_').map(word => word.split('.')[0].toUpperCase()).join(' ')
    return normalizedFilename
}