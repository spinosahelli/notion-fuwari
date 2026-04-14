import { toHtml } from 'hast-util-to-html';
import { fromHtml } from 'hast-util-from-html';
import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

export default function rehypeEncrypt() {
    return (tree, file) => {
        // 检查当前 Markdown 文件的 frontmatter 中是否有密码
        const frontmatter = file.data.astro.frontmatter;
        if (!frontmatter || !frontmatter.password) return;

        // 1. 将原始文章的 AST 转换为纯 HTML 字符串
        const htmlContent = toHtml(tree);

        // 2. 使用 bcryptjs 对密码进行哈希处理
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(frontmatter.password, salt);

        // 3. 使用明文密码对 HTML 内容进行加密
        const ciphertext = CryptoJS.AES.encrypt(htmlContent, frontmatter.password).toString();

        // 4. 创建加密后的 UI 外壳（明文 HTML 被完全移除）
        const placeholderHtml = `
            <div id="encrypted-post-wrapper" data-hash="${hash}" data-ciphertext="${ciphertext}">
                <div class="flex flex-col items-center justify-center py-12 px-4 bg-[var(--license-block-bg)] rounded-[var(--radius-large)] border border-[var(--line-divider)] my-6">
                    <div class="text-5xl mb-4">🔒</div>
                    <h3 class="text-xl font-bold text-black/80 dark:text-white/80 mb-2">文章已加密 / Encrypted Post</h3>
                    <p class="text-sm text-black/50 dark:text-white/50 mb-6">请输入密码以解锁并阅读完整内容</p>
                    <div class="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                        <input type="password" id="post-password-input" class="flex-1 px-4 py-2.5 rounded-lg bg-[var(--btn-regular-bg)] border border-[var(--line-divider)] text-black/80 dark:text-white/80 focus:outline-none focus:border-[var(--primary)] transition" placeholder="输入密码..." />
                        <button id="post-decrypt-btn" class="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 active:scale-95 transition font-medium">解锁</button>
                    </div>
                    <p id="post-decrypt-error" class="text-red-500 text-sm mt-3 hidden">密码错误，请重试！</p>
                </div>
            </div>
        `;

        // 5. 将 AST 树完全替换为我们的 UI 外壳
        const newTree = fromHtml(placeholderHtml, { fragment: true });
        tree.children = newTree.children;
    };
}
