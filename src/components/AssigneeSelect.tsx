import { useId } from 'react'
import { useAssignees, useCreateAssignee } from '@/hooks/useLeads'

interface Props {
  value: string
  onChange: (name: string) => void
  style?: React.CSSProperties
  fieldName?: string   // 🆕 unique identifier, taaki browser inhe alag samjhe
}

export default function AssigneeSelect({ value, onChange, style, fieldName }: Props) {
  const { data: assignees = [] } = useAssignees()
  const createM = useCreateAssignee()
  const listId = useId()

  const handleBlur = () => {
    const name = value.trim()
    if (!name) return
    const exists = assignees.some(a => a.name.toLowerCase() === name.toLowerCase())
    if (!exists) createM.mutate(name)
  }

  return (
    <>
      <input
        list={listId}
        name={fieldName ?? listId}     // ✅ FIX — unique name, browser autofill confuse nahi hoga
        autoComplete="off"              // ✅ FIX — browser ka apna autofill band
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder=""
        style={{
          width: '100%', height: 38, borderRadius: 8,
          border: '1px solid rgba(255,255,255,.12)',
          padding: '0 12px', fontSize: 13, outline: 'none',
          boxSizing: 'border-box', background: '#2a2d3e', color: '#fff',
          ...style,
        }}
      />
      <datalist id={listId}>
        {assignees.map(a => <option key={a._id} value={a.name} />)}
      </datalist>
    </>
  )
}