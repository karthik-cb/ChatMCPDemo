'use client'

import { useState, useMemo } from 'react'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps {
  args: {
    columns: string[]
    rows: any[][]
  }
  result: any
}

interface SortConfig {
  key: number
  direction: 'asc' | 'desc'
}

export default function DataTable({ args, result }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Set<number>>(
    new Set(args.columns.map((_, index) => index))
  )

  const data = result?.data || args.rows
  const columns = result?.columns || args.columns

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter((row: any[]) =>
        row.some((cell: any) =>
          String(cell).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig])

  const handleSort = (columnIndex: number) => {
    setSortConfig(prev => {
      if (prev?.key === columnIndex) {
        return {
          key: columnIndex,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return {
        key: columnIndex,
        direction: 'asc'
      }
    })
  }

  const toggleColumnVisibility = (columnIndex: number) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(columnIndex)) {
        newSet.delete(columnIndex)
      } else {
        newSet.add(columnIndex)
      }
      return newSet
    })
  }

  const getSortIcon = (columnIndex: number) => {
    if (sortConfig?.key !== columnIndex) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-500" />
      : <ArrowDown className="w-4 h-4 text-blue-500" />
  }

  const exportToCSV = () => {
    const visibleCols = Array.from(visibleColumns).sort()
    const csvContent = [
      visibleCols.map(i => columns[i]).join(','),
      ...filteredAndSortedData.map((row: any) => 
        visibleCols.map(i => `"${row[i] || ''}"`).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const visibleColumnsArray = Array.from(visibleColumns).sort()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Data Table</h3>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
            {filteredAndSortedData.length} rows
          </span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
            {visibleColumnsArray.length} columns
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search in all columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-muted-foreground">Columns:</span>
          <div className="flex items-center gap-1">
            {columns.map((column: any, index: number) => (
              <button
                key={index}
                onClick={() => toggleColumnVisibility(index)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  visibleColumns.has(index)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {visibleColumns.has(index) ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
                <span className="ml-1">{column}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {visibleColumnsArray.map((columnIndex) => (
                  <th
                    key={columnIndex}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b"
                  >
                    <button
                      onClick={() => handleSort(columnIndex)}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {columns[columnIndex]}
                      {getSortIcon(columnIndex)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedData.map((row: any, rowIndex: number) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {visibleColumnsArray.map((columnIndex) => (
                    <td
                      key={columnIndex}
                      className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                    >
                      <div className="max-w-xs truncate" title={String(row[columnIndex] || '')}>
                        {row[columnIndex] !== null && row[columnIndex] !== undefined
                          ? String(row[columnIndex])
                          : <span className="text-gray-400 italic">—</span>
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredAndSortedData.length} of {data.length} rows
          {searchTerm && (
            <span className="ml-2">
              (filtered by "{searchTerm}")
            </span>
          )}
        </div>
        <div>
          {sortConfig && (
            <span>
              Sorted by {columns[sortConfig.key]} ({sortConfig.direction})
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-lg font-medium mb-2">No data found</div>
          <div className="text-sm">
            {searchTerm 
              ? `No rows match "${searchTerm}"`
              : 'No data available'
            }
          </div>
        </div>
      )}
    </div>
  )
}
