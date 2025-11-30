#!/bin/bash

# ============================================
# DEPLOY SUPABASE EDGE FUNCTIONS
# ============================================
# This script deploys your edge functions to Supabase
# Run this after fixing database errors
# ============================================

echo "🚀 Deploying SikasRT Edge Functions to Supabase"
echo ""

# ============================================
# STEP 1: Check if Supabase CLI is installed
# ============================================

if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or on macOS:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# ============================================
# STEP 2: Login to Supabase
# ============================================

echo "📝 Logging in to Supabase..."
echo "   (This will open your browser)"
echo ""

supabase login

if [ $? -ne 0 ]; then
    echo "❌ Login failed!"
    exit 1
fi

echo ""
echo "✅ Login successful"
echo ""

# ============================================
# STEP 3: Get Project ID
# ============================================

echo "🔍 Enter your Supabase Project ID:"
echo "   (Find it at: https://supabase.com/dashboard → Settings → General)"
echo ""
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID is required!"
    exit 1
fi

echo ""
echo "📌 Using project: $PROJECT_ID"
echo ""

# ============================================
# STEP 4: Link Project
# ============================================

echo "🔗 Linking to your project..."
echo ""

supabase link --project-ref "$PROJECT_ID"

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project!"
    echo ""
    echo "Make sure:"
    echo "  1. Project ID is correct"
    echo "  2. You have access to this project"
    echo "  3. You're logged in"
    echo ""
    exit 1
fi

echo ""
echo "✅ Project linked"
echo ""

# ============================================
# STEP 5: Deploy Edge Function
# ============================================

echo "🚀 Deploying edge function: make-server-64eec44a"
echo "   (This may take 1-2 minutes...)"
echo ""

supabase functions deploy make-server-64eec44a

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    echo ""
    echo "Check:"
    echo "  1. Your /supabase/functions/ folder exists"
    echo "  2. Function code is valid"
    echo "  3. No syntax errors"
    echo ""
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# ============================================
# STEP 6: Test the Function
# ============================================

echo "🧪 Testing edge function..."
echo ""

FUNCTION_URL="https://$PROJECT_ID.supabase.co/functions/v1/make-server-64eec44a/health"

echo "Calling: $FUNCTION_URL"
echo ""

RESPONSE=$(curl -s "$FUNCTION_URL")

if [ -z "$RESPONSE" ]; then
    echo "⚠️  No response from function (might still be deploying)"
else
    echo "Response: $RESPONSE"
    echo ""
    
    if echo "$RESPONSE" | grep -q "ok"; then
        echo "✅ Function is working!"
    else
        echo "⚠️  Function responded but check if it's working correctly"
    fi
fi

echo ""

# ============================================
# SUCCESS!
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your edge function is now live at:"
echo "  https://$PROJECT_ID.supabase.co/functions/v1/make-server-64eec44a"
echo ""
echo "Next steps:"
echo "  1. ✅ Test your app"
echo "  2. ✅ Check admin dashboard"
echo "  3. ✅ Verify reports module works"
echo ""
echo "If something doesn't work:"
echo "  - Check Supabase logs"
echo "  - Verify environment variables are set"
echo "  - See /FIX-SUPABASE-DEPLOY-403.md"
echo ""
echo "🚀 Happy coding!"
echo ""
