export default function Backdrop({ children, onClose, zIndex = 40, wide = false }) {
  return (
    <div
      className="modal-overlay fixed inset-0 flex items-center justify-center p-[10px]"
      style={{ zIndex, overscrollBehavior: 'contain' }}
    >
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
        style={{ touchAction: 'none' }}
      />
      <div
        className={`modal-card relative z-10 w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
          wide ? 'max-w-md' : 'max-w-sm'
        }`}
        style={{ maxHeight: '90dvh' }}
      >
        {children}
      </div>
    </div>
  );
}
