type ErrorBoxProps = {
  message: string
  onRetry: () => void
}

export default function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  let messageText = message

  if (message === 'Failed to fetch') {
    messageText = 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองตรวจสอบแล้วกดใหม่'
  }

  return (
    <div role="alert" className="alert alert-error max-w-xl mx-auto my-10">
      <div>
        <h2 className="font-bold">โหลดข้อมูลไม่ได้</h2>
        <p className="text-sm">{messageText}</p>
      </div>

      <button className="btn btn-sm" onClick={onRetry}>
        ลองใหม่
      </button>
    </div>
  )
}
