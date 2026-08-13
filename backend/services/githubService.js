const { Octokit } = require("octokit");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

async function createBranch(branchName) {
    const { data: mainBranch } =
        await octokit.rest.repos.getBranch({
            owner,
            repo,
            branch: "main"
        });

    await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: mainBranch.commit.sha
    });

    console.log(`🌿 Created branch: ${branchName}`);

    return branchName;
}

async function commitFix(
    branchName,
    filePath,
    fixedCode,
    commitMessage
) {
    let sha;

    try {
        const { data: existingFile } =
            await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: branchName
            });

        sha = existingFile.sha;

    } catch (error) {
        if (error.status !== 404) {
            throw error;
        }
    }

    await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(fixedCode).toString("base64"),
        branch: branchName,
        ...(sha ? { sha } : {})
    });

    console.log(`💾 Fix committed to ${branchName}`);

    return true;
}

async function createPullRequest(
    branchName,
    title,
    body
) {
    const { data: pullRequest } =
        await octokit.rest.pulls.create({
            owner,
            repo,
            title,
            head: branchName,
            base: "main",
            body
        });

    console.log(
        `🔀 Pull Request created: ${pullRequest.html_url}`
    );

    return {
        number: pullRequest.number,
        url: pullRequest.html_url,
        title: pullRequest.title
    };
}

module.exports = {
    createBranch,
    commitFix,
    createPullRequest
};