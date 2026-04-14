import Image from 'next/image'

interface AvatarProps {
  avatarUrl?: string | null
  avatarEmoji: string
  size?: number
  className?: string
}

export function Avatar({ avatarUrl, avatarEmoji, size = 40, className = '' }: AvatarProps) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt="avatar"
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span style={{ fontSize: size * 0.5 }} className={className}>
      {avatarEmoji}
    </span>
  )
}