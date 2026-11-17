/** Bottom-centre toast for short confirmations. */
export default function Toast({ message }: { message: string }) {
  return <div className="toast">{message}</div>
}
