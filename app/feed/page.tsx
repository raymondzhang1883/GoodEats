'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { Heart, MessageCircle, Share2, Loader2, Plus, Send, X } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'

type Post = {
  id: string
  content: string
  images: string[] | null
  likes_count: number
  created_at: string
  user: {
    username: string
    full_name: string
    avatar_url: string | null
  }
  event: {
    title: string
    event_type: string
  } | null
  comments: {
    id: string
    content: string
    created_at: string
    user: {
      username: string
      full_name: string
    }
  }[]
  user_has_liked?: boolean
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posting, setPosting] = useState(false)
  const [commentingOnPost, setCommentingOnPost] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [commenting, setCommenting] = useState(false)

  useEffect(() => {
    fetchPosts()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setCurrentUser(data)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users!user_id(username, full_name, avatar_url),
          event:events(title, event_type),
          comments(
            id,
            content,
            created_at,
            user:users!user_id(username, full_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Check which posts the current user has liked
      if (user) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)

        const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
        
        const postsWithLikes = (data || []).map(post => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id)
        }))
        
        setPosts(postsWithLikes as any)
      } else {
        setPosts(data as any || [])
      }
    } catch (error: any) {
      toast.error('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim() || !currentUser) return

    setPosting(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          content: newPost,
        })
        .select(`
          *,
          user:users!user_id(username, full_name, avatar_url),
          event:events(title, event_type),
          comments(*)
        `)
        .single()

      if (error) throw error

      setPosts([data as any, ...posts])
      setNewPost('')
      setShowCreatePost(false)
      toast.success('Post created!')
    } catch (error: any) {
      toast.error('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to like posts')
      return
    }

    const post = posts.find(p => p.id === postId)
    if (!post) return

    const isLiked = post.user_has_liked

    // Optimistic update
    setPosts(posts.map(p =>
      p.id === postId
        ? { 
            ...p, 
            likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
            user_has_liked: !isLiked
          }
        : p
    ))

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)

        if (error) throw error
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id
          })

        if (error) throw error
      }
    } catch (error: any) {
      // Revert on error
      setPosts(posts.map(p =>
        p.id === postId
          ? { 
              ...p, 
              likes_count: isLiked ? p.likes_count + 1 : p.likes_count - 1,
              user_has_liked: isLiked
            }
          : p
      ))
      
      if (error.message?.includes('duplicate')) {
        toast.error('You already liked this post')
      } else {
        toast.error('Failed to update like')
      }
    }
  }

  const handleComment = async (postId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to comment')
      return
    }

    if (!newComment.trim()) return

    setCommenting(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: newComment.trim()
        })
        .select(`
          id,
          content,
          created_at,
          user:users!user_id(username, full_name)
        `)
        .single()

      if (error) throw error

      // Update posts with new comment
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, data as any] }
          : post
      ))

      setNewComment('')
      setCommentingOnPost(null)
      toast.success('Comment added!')
    } catch (error: any) {
      toast.error('Failed to add comment')
    } finally {
      setCommenting(false)
    }
  }

  const handleShare = async (postId: string) => {
    const postUrl = `${window.location.origin}/feed#${postId}`
    
    try {
      await navigator.clipboard.writeText(postUrl)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      potluck: '🍲',
      dinner: '🍽️',
      cooking_class: '👨‍🍳',
      picnic: '🧺',
      other: '🎉'
    }
    return icons[type] || '🎉'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Community Feed</h1>
          <button
            onClick={() => setShowCreatePost(true)}
            className="p-2 bg-primary-500 text-white rounded-full"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Posts */}
      <div className="mobile-container py-4">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {post.user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{post.user.full_name}</p>
                      <p className="text-sm text-gray-500">
                        @{post.user.username} · {format(new Date(post.created_at), 'MMM d')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  {post.event && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-primary-500">
                      <span>{getEventIcon(post.event.event_type)}</span>
                      <span>at {post.event.title}</span>
                    </div>
                  )}
                  <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>

                  {/* Images Placeholder */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {post.images.map((image, idx) => (
                        <div key={idx} className="bg-gray-200 rounded-lg aspect-square" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 pb-4 flex items-center justify-between">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      post.user_has_liked 
                        ? 'text-red-500' 
                        : 'text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes_count}</span>
                  </button>

                  <button 
                    onClick={() => setCommentingOnPost(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments.length}</span>
                  </button>

                  <button 
                    onClick={() => handleShare(post.id)}
                    className="text-gray-600 hover:text-primary-500 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Comments Preview */}
                {post.comments.length > 0 && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    {post.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="text-sm mb-2">
                        <span className="font-medium">@{comment.user.username}</span>
                        <span className="ml-2 text-gray-600">{comment.content}</span>
                      </div>
                    ))}
                    {post.comments.length > 2 && (
                      <button 
                        onClick={() => setCommentingOnPost(post.id)}
                        className="text-sm text-primary-500"
                      >
                        View all {post.comments.length} comments
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share your food adventures!</p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your food experience..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />

            <div className="flex items-center gap-3 mt-4 justify-end">
              <button
                onClick={() => setShowCreatePost(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim() || posting}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                {posting && <Loader2 className="h-4 w-4 animate-spin" />}
                Post
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Comment Modal */}
      <AnimatePresence>
        {commentingOnPost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Comments</h2>
                <button
                  onClick={() => {
                    setCommentingOnPost(null)
                    setNewComment('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {posts.find(p => p.id === commentingOnPost)?.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {comment.user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.user.full_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-3">
                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                )) || []}

                {posts.find(p => p.id === commentingOnPost)?.comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No comments yet. Be the first!</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !commenting && newComment.trim()) {
                        handleComment(commentingOnPost)
                      }
                    }}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleComment(commentingOnPost)}
                    disabled={!newComment.trim() || commenting}
                    className="p-2 bg-primary-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                  >
                    {commenting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}