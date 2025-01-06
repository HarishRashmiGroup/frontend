import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CommentsModal = ({ isOpen, onClose, taskId, showCustomAlert }) => {
  
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
  
    const fetchComments = async () => {
      setIsLoadingComments(true);
      setCommentError(null);
      try {
        // const response = await fetch(`http://localhost:3003/comment/${taskId}`, {
          const response = await fetch(`https://backend-9xmz.onrender.com/comment/${taskId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        setCommentError(error.message);
        showCustomAlert('Failed to load comments');
      } finally {
        setIsLoadingComments(false);
      }
    };
  
    useEffect(() => {
      setIsDisabled(false);
      setToken(localStorage.getItem('token'));
      if (isOpen) {
        fetchComments();
      }
    }, [isOpen, taskId]);
  
    const handleCommentSubmit = async () => {
      setIsDisabled(true);
      if (!newComment.trim()) return;
  
      try {
        // const response = await fetch('http://localhost:3003/comment', {
          const response = await fetch('https://backend-9xmz.onrender.com/comment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              description: newComment.trim(),
              taskId: taskId
            }),
          });
  
        if (!response.ok) {
          throw new Error('Failed to add comment');
        }
  
        setNewComment('');
        fetchComments();
        showCustomAlert('Comment added successfully');
      } catch (error) {
        showCustomAlert('Failed to add comment');
      }
      setIsDisabled(false);
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ overflow: 'auto' }}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Comments</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
  
          <div className="p-4 h-96 max-h-96 overflow-y-auto">
            {isLoadingComments ? (
              <div className="text-center py-4">Loading comments...</div>
            ) : commentError ? (
              <div className="text-red-500 text-center py-4">{commentError}</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No comments yet</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{comment.createdBy}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{comment.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
  
          <div className="p-4 border-t">
            <div className="flex flex-col space-y-2">
              <textarea
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || isDisabled}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  export default CommentsModal;