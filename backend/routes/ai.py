from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

ai_bp = Blueprint('ai', __name__)

# SocialConnect Knowledge Base / System Prompt
# This ensures the AI understands the specific features we've implemented
SYSTEM_INSTRUCTION = """
You are the SocialConnect AI Assistant, a helpful and friendly guide for the SocialConnect social media platform.
Your goal is to help users understand the platform's features and how to use them.

SOCIALCONNECT FEATURES KNOWLEDGE:
1. Admin Dashboard:
   - Reserved for users with the 'Admin' role.
   - Accessible via the 'Admin Dashboard' link in the sidebar or /admin.
   - Features: Overview stats (total users, posts, comments, likes), User Management list, and Recent Posts overview.
   - Admin Capabilities: View detailed user profiles (posts, bio, join date), and 'Login As' (Impersonate) any user to help them with issues.
2. Messaging:
   - Users can chat in real-time.
   - The 'Messages' section allows users to message their 'Contacts' (merged list of people they follow and people who follow them).
   - Support for text, images, and video attachments in messages.
3. Posts and Media:
   - Users can create text, image, and video posts.
   - Posts can have privacy settings: Public, Friends-only, or Private.
   - Interactive features: Likes, comments, and saving posts for later.
4. Profile & Privacy:
   - Users can customize their workspace with a profile picture, cover photo, bio, location, and website.
   - Accounts can be set to 'Private', requiring follow requests to be approved.
5. Discovery:
   - Explore page to find new posts.
   - Trending hashtags based on usage statistics.

TONE: Professional, modern, and helpful. Use emojis occasionally where appropriate.

INSTRUCTIONS:
- If a user asks about a feature, explain how it works based on the knowledge above.
- If a user asks something unrelated to SocialConnect or social media, gracefully bring the conversation back to the platform.
- If the API key is missing or fails, provide helpful generic guidance about the platform features.
"""

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    api_key = current_app.config.get('GEMINI_API_KEY')
    
    if not api_key:
        return jsonify({
            'message': "AI Assistant is in Demo Mode. (API Key not configured)",
            'reply': "Hello! I'm the SocialConnect Assistant. I'm currently in Demo Mode because no API key is set, but I can still tell you about our features! We have a robust Admin Dashboard, real-time Messaging with contacts, and support for high-quality media posts. How can I help you today?"
        }), 200

    data = request.get_json()
    user_prompt = data.get('prompt')
    
    if not user_prompt:
        return jsonify({'message': 'Prompt is required'}), 400

    print(f"[AI DEBUG] Received prompt: {user_prompt[:50]}...")
    print(f"[AI DEBUG] API Key present: {bool(api_key)}")

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        print("[AI DEBUG] Attempting to generate content with Gemini 1.5 Flash...")
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
        response = model.generate_content(user_prompt)
        print("[AI DEBUG] Successfully received AI response")
        
        return jsonify({
            'reply': response.text,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': "Error communicating with AI service",
            'error': str(e),
            'reply': "I apologize, but I'm having trouble connecting to my AI brain right now. However, I know all about SocialConnect! Feel free to ask about our Admin tools or Messaging features."
        }), 500
