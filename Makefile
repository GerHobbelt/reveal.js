

# since grunt 0.4 the tool sits in grunt-cli/bin rather than grunt/bin
#
# Yes, I loath grunt. In fact, it's so 'beta' you DO NOT EVER want to
# install it in the way advised everywhere which is as root via
#   npm install grunt -g
# because quite a few libs in here break very badly if their 'grunt'
# is only a wee bit out of touch.
# Hence we FORCE the use of local installed grunts: each their own...
#
LOCAL_GRUNT = node_modules/grunt-cli/bin/grunt


all: $(LOCAL_GRUNT)
	$(LOCAL_GRUNT)


# did 'npm install' run before?
$(LOCAL_GRUNT):
	@echo "*** Installing NodeJS / GRUNT for RevealJS ***"
	npm install

